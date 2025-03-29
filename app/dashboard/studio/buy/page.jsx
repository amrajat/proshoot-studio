"use client";

import { useState, useTransition, useEffect } from "react";
import Autoplay from "embla-carousel-autoplay";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import config from "@/config";
import { createCheckoutLS } from "@/lib/supabase/actions/server";
import {
  Check,
  Minus,
  Plus,
  ShieldCheck,
  TrendingUp,
  Lock,
  Image as ImageIcon,
  Clock,
  Tag,
  MessageCircle,
  RefreshCcw,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { REVIEWS_ARRAY } from "@/lib/reviews";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import StarRatings from "@/components/shared/star-ratings";
import Image from "next/image";
import * as Sentry from "@sentry/nextjs";
import { openIntercomMessenger } from "@/lib/intercom";
import Error from "@/components/Error";

const planIcons = {
  Basic: (
    <svg
      className="size-6 items-center text-primary"
      width={34}
      height={30}
      viewBox="0 0 34 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        y={5}
        width={20}
        height={20}
        rx={10}
        fill="currentColor"
        className="fill-primary"
      />
    </svg>
  ),
  Standard: (
    <svg
      className="size-6 items-center text-primary"
      width={34}
      height={30}
      viewBox="0 0 34 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        y={5}
        width={20}
        height={20}
        rx={10}
        fill="currentColor"
        className="fill-primary"
      />
      <rect
        x={14}
        y={5}
        width={20}
        height={20}
        rx={10}
        fill="currentColor"
        className="fill-primary"
      />
    </svg>
  ),
  Premium: (
    <svg
      className="size-6 items-center text-primary"
      width={34}
      height={30}
      viewBox="0 0 34 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x={7}
        width={20}
        height={20}
        rx={10}
        fill="currentColor"
        className="fill-primary/20"
      />
      <rect
        y={10}
        width={20}
        height={20}
        rx={10}
        fill="currentColor"
        className="fill-primary/40"
      />
      <rect
        x={14}
        y={10}
        width={20}
        height={20}
        rx={10}
        fill="currentColor"
        className="fill-primary"
      />
    </svg>
  ),
  Pro: (
    <svg
      className="size-6 items-center text-primary"
      width={34}
      height={30}
      viewBox="0 0 34 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width={20}
        height={20}
        rx={10}
        fill="currentColor"
        className="fill-primary/20"
      />
      <rect
        y={10}
        width={20}
        height={20}
        rx={10}
        fill="currentColor"
        className="fill-primary/40"
      />
      <rect
        x={14}
        y={10}
        width={20}
        height={20}
        rx={10}
        fill="currentColor"
        className="fill-primary/60"
      />
      <rect
        x={14}
        width={20}
        height={20}
        rx={10}
        fill="currentColor"
        className="fill-primary"
      />
    </svg>
  ),
};

export default function BuyStudio() {
  const [plan, setPlan] = useState("Premium");
  const [quantity, setQuantity] = useState(1);
  const [pending, startTransaction] = useTransition();
  const [couponsLeft, setCouponsLeft] = useState(3);
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 59,
    seconds: 59,
  });
  const [error, setError] = useState(null);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleQuantityChange = (value) => {
    if (value >= 1) {
      setQuantity(value);
    }
  };

  async function checkout() {
    setError(null);

    // Get FirstPromoter reference if available
    const firstPromoterReference =
      document.cookie.match(/_fprom_ref=([^;]+)/)?.[1] || null;
    const firstPromoterTID =
      document.cookie.match(/_fprom_tid=([^;]+)/)?.[1] || null;

    startTransaction(async () => {
      try {
        const result = await createCheckoutLS(
          plan,
          quantity,
          config.PLANS[plan].variantId,
          firstPromoterReference,
          firstPromoterTID
        );

        // Handle the redirect on the client side
        if (result && result.url) {
          window.location.href = result.url;
        } else {
          throw new Error("No checkout URL returned from server");
        }
      } catch (error) {
        console.error("Checkout Error:", error);
        Sentry.captureException(error);
        setError(
          "We couldn't process your checkout. Please try again or contact our support team."
        );
      }
    });
  }

  const handleContactSupport = () => {
    openIntercomMessenger({
      message: "I'm having trouble with checkout.",
      metadata: {
        page: "buy_studio",
        plan: plan,
        quantity: quantity,
        error: error,
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="mb-8">
          <Error message="Checkout Error" details={error} />
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              onClick={() => setError(null)}
              className="flex items-center"
              variant="default"
            >
              {" "}
              <RefreshCcw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Button
              onClick={handleContactSupport}
              className="flex items-center"
              variant="default"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Contact support
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto gap-6 md:gap-8 py-0 md:py-0 px-1 sm:px-6 lg:px-0">
        {/* Left Side - Checkout Form */}
        <div className="w-full lg:w-1/2 lg:self-center">
          <Card className="border border-border/40 shadow-sm bg-gradient-to-b from-background to-muted/20 backdrop-blur-sm rounded-lg overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60"></div>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-3xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                Buy Headshots Package
              </CardTitle>
              <CardDescription className="text-base">
                Ultra-realistic AI-powered professional headshots that make you
                stand out.
              </CardDescription>

              {/* Benefits Highlight Section - Condensed */}
              <div className="mt-4 flex flex-col gap-2 text-sm">
                <div className="flex justify-center gap-3 flex-wrap">
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 py-1 px-2 rounded-full border-primary/20 bg-primary/5 text-primary shadow-sm"
                  >
                    <ShieldCheck className="size-3" /> 100% satisfaction
                    guarantee
                  </Badge>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 py-1 px-2 rounded-full border-primary/20 bg-primary/5 text-primary shadow-sm"
                  >
                    <ShieldCheck className="size-3" /> 7-days money-back
                    guarantee
                  </Badge>
                </div>
              </div>

              {/* Limited Time Offer */}
            </CardHeader>
            <CardContent className="px-5 py-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  checkout();
                }}
                className="space-y-4"
              >
                <RadioGroup
                  value={plan}
                  onValueChange={setPlan}
                  className="grid grid-cols-1 md:grid-cols-2 gap-3"
                >
                  {Object.entries(config.PLANS).map(([key, value]) => (
                    <Label
                      key={key}
                      className={`relative flex flex-col items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:border-primary hover:bg-primary/5 hover:shadow-sm ${
                        plan === key
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border"
                      }`}
                    >
                      <RadioGroupItem value={key} className="sr-only" />
                      <div className="flex items-center space-x-2">
                        {planIcons[key]}
                        <span className="text-base font-semibold">{key}</span>
                      </div>
                      <span className="text-xl font-bold mb-1 mt-1 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                        ${value.planPrice}
                        {key === "Premium" && (
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary text-xs ml-2 font-medium"
                          >
                            <TrendingUp
                              className="size-3 mr-1"
                              strokeWidth={2}
                            />
                            Most Popular
                          </Badge>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground mb-1 font-medium">
                        {value.headshots} Professional Headshots
                      </span>
                      <span className="text-xs text-muted-foreground mb-1 font-medium">
                        {value.headshots / 4} Unique Outfits & Backgrounds
                      </span>

                      {[key === "Premium", key === "Pro"].some(Boolean) && (
                        <>
                          <Badge
                            variant="destructive"
                            className="text-xs font-medium mb-2"
                          >
                            <Sparkles
                              className="size-4 mr-1"
                              strokeWidth={1.5}
                            />
                            Custom Outfits
                          </Badge>
                          <Badge
                            variant="destructive"
                            className="text-xs font-medium"
                          >
                            <WandSparkles
                              className="size-4 mr-1"
                              strokeWidth={1.5}
                            />
                            Custom Backgrounds
                          </Badge>
                        </>
                      )}

                      {plan === key && (
                        <div className="absolute top-3 right-3 w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center bg-primary/10">
                          <Check
                            className="size-2 text-primary"
                            strokeWidth={4}
                          />
                        </div>
                      )}
                    </Label>
                  ))}
                </RadioGroup>

                <p className="text-sm text-muted-foreground mb-1 font-medium">
                  Premium (4*2=8 headshots) and Pro (4*6=24 headshots) plans
                  include extra custom outfits and backgrounds for complete
                  control over your headshots.
                </p>

                <Separator className="bg-border/50" />

                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex gap-1 items-start flex-col">
                    <span>Quantity</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      How many people?
                    </span>
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="rounded-full h-7 w-7 border-border/60"
                    >
                      <Minus className="size-3" strokeWidth={2} />
                    </Button>
                    <Input
                      id="quantity"
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) =>
                        handleQuantityChange(parseInt(e.target.value, 10))
                      }
                      className="w-14 text-center rounded-md border-border/60 h-8"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="rounded-full h-7 w-7 border-border/60"
                    >
                      <Plus className="size-3" strokeWidth={2} />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 mt-4">
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total</span>
                    <span>
                      {/* <span className="text-md font-bold mr-4 text-destructive line-through decoration-1 decoration-primary">
                        ${Math.trunc(quantity * config.PLANS[plan].planPrice)}
                      </span> */}
                      <span className="text-lg font-bold text-primary">
                        ${Math.trunc(quantity * config.PLANS[plan].planPrice)}
                      </span>
                      {/* <span className="ml-1 text-xs bg-success/10 text-success px-1.5 py-0.5 rounded">
                        SAVE 20%
                      </span> */}
                    </span>
                  </div>

                  {/* Trust Badges */}
                  <div className="flex justify-center gap-4 py-1">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <ShieldCheck className="mr-1 size-3 text-success/70" />
                      7-days money-back guarantee
                    </div>
                    {/* <div className="flex items-center text-xs text-muted-foreground">
                      <CreditCard className="size-3 mr-1 text-success/70" />
                      Multiple Payment Options
                    </div> */}
                  </div>

                  <Button
                    type="submit"
                    className="w-full text-base py-5 font-bold leading-tight tracking-tight lg:leading-[1.1]"
                    size="lg"
                    disabled={!quantity || pending}
                  >
                    {pending ? "Processing..." : `Generate Headshots Now`}
                  </Button>
                  {/* <span className="text-muted-foreground text-xs flex items-center justify-center">
                    <ShieldCheck className="mr-1.5 size-4 text-success" />
                    7-days money-back guarantee
                  </span> */}
                  <span className="text-muted-foreground text-xs flex items-center justify-center">
                    <Lock className="size-3 mr-1 text-success/70" />
                    Secured by&nbsp;
                    <Image
                      className="inline transition-transform duration-200 opacity-75 hover:opacity-100"
                      src="/companies/lemon-squeezy.svg"
                      width={100}
                      height={100}
                      alt="Lemon Squeezy Logo"
                    />
                  </span>
                </div>
              </form>

              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center justify-center">
                  Next, you'll be redirected to create your headshots.
                </p>
                {/* <p className="flex items-center justify-center">
                  Use LMTD20 promo at your next page.
                </p> */}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Headshot Showcase */}
        <div className="w-full lg:w-1/2 relative lg:self-center rounded-lg overflow-hidden">
          <div className="absolute -top-2 -left-2 w-20 h-20 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-primary/10 rounded-full blur-3xl"></div>

          {/* Added decorative elements to balance visual height */}
          <div className="hidden lg:block absolute -top-6 right-12 w-24 h-24 rounded-full bg-primary/5 blur-2xl"></div>
          <div className="hidden lg:block absolute -bottom-6 left-12 w-24 h-24 rounded-full bg-primary/5 blur-2xl"></div>

          <HeadshotShowcase />
          {/* Limited Time Offer - New Component */}
          {/* <div className="mt-4 mb-2 mx-auto max-w-md">
            <div className="relative overflow-hidden rounded-lg border-2 border-primary/30 bg-primary/5 p-4 shadow-sm">
              <div className="absolute -top-6 -right-6 h-12 w-12 rounded-full bg-primary/20 blur-xl"></div>
              <div className="absolute -bottom-6 -left-6 h-12 w-12 rounded-full bg-primary/20 blur-xl"></div>

              <div className="relative z-10">
                <div className="flex items-start flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-destructive animate-pulse">
                      Limited Time Offer!
                    </h4>
                  </div>
                  <div className="text-xs font-medium text-destructive flex items-center">
                    <Tag className="mr-1 size-3" />
                    <span>Only {couponsLeft} coupons left to redeem.</span>
                  </div>
                </div>

                <div className="mt-2 flex items-start justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">
                      Promo Code:{" "}
                      <span className="font-bold text-primary">LMTD20</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Redeem at next page for 20% off.
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-medium">
                    <Clock className="size-3 text-primary" />
                    <div className="flex gap-1">
                      <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                        {timeLeft.hours.toString().padStart(2, "0")}
                      </span>
                      :
                      <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                        {timeLeft.minutes.toString().padStart(2, "0")}
                      </span>
                      :
                      <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                        {timeLeft.seconds.toString().padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

const HeadshotShowcase = () => {
  return (
    <div className="flex flex-col justify-center h-full">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
          Don't take our word for it
        </h3>
        <p className="text-muted-foreground text-sm mt-1">
          Trust our customers
        </p>
      </div>

      <Carousel
        opts={{
          align: "center",
          loop: true,
        }}
        className="w-full"
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
      >
        <CarouselContent>
          {REVIEWS_ARRAY.filter(
            (review) => review.comment.length > 1 && review.avatar
          ).map((review) => (
            <CarouselItem key={review.id}>
              <Card className="border border-border/40 shadow-sm bg-gradient-to-b from-background to-muted/20 backdrop-blur-sm rounded-lg overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
                        <Image
                          src={review.avatar}
                          alt={`${review.name}`}
                          className="w-full h-full object-cover"
                          width={250}
                          height={250}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-base">
                            {review.name}
                          </h4>
                          {/* {review.position && (
                            <p className="text-xs text-muted-foreground">
                              {review.position}
                              {review.company && ` at ${review.company}`}
                            </p>
                          )} */}
                        </div>
                        <StarRatings rating={review.rating} size="size-3" />
                      </div>
                      <p className="text-sm line-clamp-3">{review.comment}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Social proof badges */}
      <div className="mt-6 space-y-3">
        <div className="flex justify-center mt-4">
          <Badge
            variant="outline"
            className="text-xs py-1 px-3 rounded-full border-primary/20 bg-primary/5 text-primary/80"
          >
            <ShieldCheck className="size-3 mr-2" />
            Trusted by 7,000+ professionals worldwide
          </Badge>
        </div>
        <div className="flex justify-center mt-4">
          <Badge
            variant="outline"
            className="text-xs py-1 px-3 rounded-full border-primary/20 bg-primary/5 text-primary/80"
          >
            <ImageIcon className="size-3 mr-2" />
            Generated 4,00,00,0+ Professional Headshots
          </Badge>
        </div>
      </div>
    </div>
  );
};
