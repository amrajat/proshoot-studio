import Image from "next/image";

function page() {
  const images = [
    "https://fpczpgjfyejjuezbiqjq.supabase.co/storage/v1/object/public/studios/2024-10/gxjbtdswaxrm20cjwgd94rspm8/results/c3205996-0bf8-4628-a13a-724c2c8c3abf.jpg",
    "https://fpczpgjfyejjuezbiqjq.supabase.co/storage/v1/object/public/studios/2024-10/gxjbtdswaxrm20cjwgd94rspm8/results/ae1a5d8c-56d8-470f-8fd8-9a3836b074f5.jpg",
    "https://fpczpgjfyejjuezbiqjq.supabase.co/storage/v1/object/public/studios/2024-10/gxjbtdswaxrm20cjwgd94rspm8/results/b39b5894-671b-4512-b7bd-0f39131fa0e2.jpg",
    "https://fpczpgjfyejjuezbiqjq.supabase.co/storage/v1/object/public/studios/2024-10/gxjbtdswaxrm20cjwgd94rspm8/results/5d0f3b74-aaf7-49e7-a052-2e3076100593.jpg",
    "https://fpczpgjfyejjuezbiqjq.supabase.co/storage/v1/object/public/studios/2024-10/gxjbtdswaxrm20cjwgd94rspm8/results/aaff183b-9668-4b73-8474-4547e8bb38ee.jpg",
    "https://fpczpgjfyejjuezbiqjq.supabase.co/storage/v1/object/public/studios/2024-10/gxjbtdswaxrm20cjwgd94rspm8/results/8f9d21f6-b55a-44bb-8e86-deeb96f1ff1d.jpg",
    "https://fpczpgjfyejjuezbiqjq.supabase.co/storage/v1/object/public/studios/2024-10/gxjbtdswaxrm20cjwgd94rspm8/results/1f16ae5d-e762-41f3-b28d-b78573684de8.jpg",
    "https://fpczpgjfyejjuezbiqjq.supabase.co/storage/v1/object/public/studios/2024-10/gxjbtdswaxrm20cjwgd94rspm8/results/d6c69dda-10ba-4cb0-b42f-809153010556.jpg",
    "https://fpczpgjfyejjuezbiqjq.supabase.co/storage/v1/object/public/studios/2024-10/gxjbtdswaxrm20cjwgd94rspm8/results/fea3542a-4d38-462a-b051-522093066b0c.jpg",
    "https://fpczpgjfyejjuezbiqjq.supabase.co/storage/v1/object/public/studios/2024-10/gxjbtdswaxrm20cjwgd94rspm8/results/95798b16-916b-471f-8873-3b6a8329a5d7.jpg",
    "https://fpczpgjfyejjuezbiqjq.supabase.co/storage/v1/object/public/studios/2024-10/gxjbtdswaxrm20cjwgd94rspm8/results/7fd52816-4ed9-4e2b-82bb-0cc061beb75c.jpg",
    "https://fpczpgjfyejjuezbiqjq.supabase.co/storage/v1/object/public/studios/2024-10/gxjbtdswaxrm20cjwgd94rspm8/results/790fc3dd-9cdc-49d1-904f-d2eb02f41563.jpg",
    "https://fpczpgjfyejjuezbiqjq.supabase.co/storage/v1/object/public/studios/2024-10/gxjbtdswaxrm20cjwgd94rspm8/results/fb6da906-753f-4622-9ee8-ac4b275e65ca.jpg",
    "https://fpczpgjfyejjuezbiqjq.supabase.co/storage/v1/object/public/studios/2024-10/gxjbtdswaxrm20cjwgd94rspm8/results/8bd5709e-57ae-4ef0-8069-3735d50fc77e.jpg",
    "https://fpczpgjfyejjuezbiqjq.supabase.co/storage/v1/object/public/studios/2024-10/gxjbtdswaxrm20cjwgd94rspm8/results/fd5e0edb-df77-4313-a951-49138a832fff.jpg",
    "https://fpczpgjfyejjuezbiqjq.supabase.co/storage/v1/object/public/studios/2024-10/gxjbtdswaxrm20cjwgd94rspm8/results/12f6cbd3-0e4d-44da-b20c-8ecbcab7ff88.jpg",
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {images.map((image, index) => (
        <div>
          {index + 1}
          <Image src={image} key={index} width={1024} height={1024} />
        </div>
      ))}
    </div>
  );
}

export default page;
