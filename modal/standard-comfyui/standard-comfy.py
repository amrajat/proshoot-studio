import json
import subprocess
import uuid
from pathlib import Path
from typing import Dict

import modal
import modal.experimental

image = (  # build up a Modal Image to run ComfyUI, step by step
    modal.Image.debian_slim(  # start from basic Linux with Python
        python_version="3.11"
    )
    .apt_install("git")  # install git to clone ComfyUI
    .pip_install("fastapi[standard]==0.115.4")  # install web dependencies
    .pip_install("comfy-cli==1.4.1")  # install comfy-cli
    .run_commands(  # use comfy-cli to install ComfyUI and its dependencies
        "comfy --skip-prompt install --fast-deps --nvidia --version 0.3.41"
    )
)


def hf_download():
    from huggingface_hub import hf_hub_download, login, snapshot_download
    import os

    # Authenticate with Hugging Face using token from environment
    hf_token = os.environ.get("HF_TOKEN")
    if hf_token:
        login(token=hf_token)
        print("Successfully authenticated with Hugging Face")
    else:
        print("Warning: No HF_TOKEN found. Some models may not be accessible.")

    # Create necessary directories
    os.makedirs("/root/comfy/ComfyUI/models/unet", exist_ok=True)
    os.makedirs("/root/comfy/ComfyUI/models/vae", exist_ok=True)
    os.makedirs("/root/comfy/ComfyUI/models/clip", exist_ok=True)

    # Download FLUX.1-dev model (UNet) - using unet folder as requested
    flux_dev_model = hf_hub_download(
        repo_id="black-forest-labs/FLUX.1-dev",
        filename="flux1-dev.safetensors",
        cache_dir="/cache",
        token=hf_token,
    )
    
    # Download VAE model from FLUX.1-schnell
    vae_model = hf_hub_download(
        repo_id="black-forest-labs/FLUX.1-schnell",
        filename="ae.safetensors",
        cache_dir="/cache",
        token=hf_token,
    )
    
    # Download text encoders
    t5_model = hf_hub_download(
        repo_id="comfyanonymous/flux_text_encoders",
        filename="t5xxl_fp16.safetensors",
        cache_dir="/cache",
        token=hf_token,
    )
    
    clip_model = hf_hub_download(
        repo_id="comfyanonymous/flux_text_encoders",
        filename="clip_l.safetensors",
        cache_dir="/cache",
        token=hf_token,
    )
   

    

    # Symlink models to ComfyUI directories
    subprocess.run(
        f"ln -sf {flux_dev_model} /root/comfy/ComfyUI/models/unet/flux1-dev.safetensors",
        shell=True,
        check=True,
    )
    
    subprocess.run(
        f"ln -sf {vae_model} /root/comfy/ComfyUI/models/vae/ae.safetensors",
        shell=True,
        check=True,
    )
    
    subprocess.run(
        f"ln -sf {t5_model} /root/comfy/ComfyUI/models/clip/t5xxl_fp16.safetensors",
        shell=True,
        check=True,
    )
    
    subprocess.run(
        f"ln -sf {clip_model} /root/comfy/ComfyUI/models/clip/clip_l.safetensors",
        shell=True,
        check=True,
    )


vol = modal.Volume.from_name("hf-hub-cache", create_if_missing=True)

image = (
    # install huggingface_hub with hf_transfer support to speed up downloads
    image.pip_install("huggingface_hub[hf_transfer]>=0.34.0,<1.0")
    .env({"HF_HUB_ENABLE_HF_TRANSFER": "1"})
    .run_function(
        hf_download,
        # persist the HF cache to a Modal Volume so future runs don't re-download models
        volumes={"/cache": vol},
        secrets=[modal.Secret.from_name("huggingface-token")],
    )    
)

# Lastly, copy the ComfyUI workflow JSON to the container.
# image = image.add_local_file(
#     Path(__file__).parent / "workflow_api.json", "/root/workflow_api.json"
# )
image = image.add_local_file(
    Path(__file__).parent / "lora-bf32.safetensors", "/root/comfy/ComfyUI/models/loras/lora-bf32.safetensors"
)
image = image.add_local_file(
    Path(__file__).parent / "lora-bf32-2.safetensors", "/root/comfy/ComfyUI/models/loras/lora-bf32-2.safetensors"
)
image = image.add_local_file(
    Path(__file__).parent / "lora-bf32-3.safetensors", "/root/comfy/ComfyUI/models/loras/lora-bf32-3.safetensors"
)
image = image.add_local_file(
    Path(__file__).parent / "lora-pipeline-1.safetensors", "/root/comfy/ComfyUI/models/loras/lora-pipeline-1.safetensors"
)


# ## Running ComfyUI interactively

# Spin up an interactive ComfyUI server by wrapping the `comfy launch` command in a Modal Function
# and serving it as a [web server](https://modal.com/docs/guide/webhooks#non-asgi-web-servers).

app = modal.App(name="example-comfyapp", image=image)


@app.function(
    max_containers=1,  # limit interactive session to 1 container
    gpu="L40S",  # good starter GPU for inference
    volumes={"/cache": vol},  # mounts our cached models
)
@modal.concurrent(
    max_inputs=10
)  # required for UI startup process which runs several API calls concurrently
@modal.web_server(8000, startup_timeout=60)
def ui():
    subprocess.Popen("comfy launch -- --listen 0.0.0.0 --port 8000 --disable-metadata", shell=True)


