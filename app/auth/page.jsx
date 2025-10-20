import { LoginForm } from "@/components/services/login-form";
import Image from "next/image";
import { Star } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block overflow-hidden">
        <Image
          src="/images/juan-carlos-ayala.jpg"
          alt="professional headshot generated using ai headshot generator proshoot"
          className="absolute inset-0 h-full w-full object-cover"
          width={1024}
          height={1024}
          priority
        />
        {/* Gradient overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        
        {/* Testimonial overlay */}
        <div className="absolute bottom-0 left-0 right-0 text-white">
          <div className="bg-white/10 backdrop-blur-xl p-6 border-t border-white/20">
            {/* 5 Star Rating */}
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`bg-success p-1`}>

                <svg
                height="21px"
                viewBox="0 0 20 21"
                width="20px"
                xmlns="http://www.w3.org/2000/svg"
                className={`size-4 text-white fill-white`}
              >
                <g fill="currentColor">
                  <path d="M10,15.273 L16.18,19 L14.545,11.971 L20,7.244 L12.809,6.627 L10,0 L7.191,6.627 L0,7.244 L5.455,11.971 L3.82,19 L10,15.273 Z" />
                </g>
              </svg>
              </span>
              ))}
            </div>
            
            {/* Review Text */}
            <p className="text-white/90 mb-4 text-base leading-relaxed">
              "This one is the winner."
            </p>
            
            {/* Reviewer Info */}
            <div className="text-white/80">
              <p className="font-semibold text-white">Juan Carlos Ayala</p>
              <p className="text-xs text-white/70">AIA, PMP®, LEED AP</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
