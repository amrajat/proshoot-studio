"use client";

import { useState, useTransition } from "react";
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
import { Check, Minus, Plus, ShieldCheck, TrendingUp } from "lucide-react";
import ToolTip from "@/components/shared/tooltip";
import { REVIEWS_ARRAY } from "@/lib/reviews";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StarRatings from "@/components/shared/star-ratings";

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

  const handleQuantityChange = (value) => {
    if (value >= 1) {
      setQuantity(value);
    }
  };

  async function checkout() {
    const firstPromoterReference =
      document.cookie.match(/_fprom_ref=([^;]+)/)?.[1] || null;
    const firstPromoterTID =
      document.cookie.match(/_fprom_tid=([^;]+)/)?.[1] || null;

    startTransaction(async () => {
      try {
        await createCheckoutLS(
          plan,
          quantity,
          config.PLANS[plan].variantId,
          firstPromoterReference,
          firstPromoterTID
        );
      } catch (error) {
        console.error("Checkout Error:", error);
      }
    });
  }

  return (
    <Card className="w-full max-w-xl mx-auto border-none shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold tracking-tighter">
          Buy Headshots Package
        </CardTitle>
        <CardDescription>
          Buy our headshot packages to to generate professional headshots.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            checkout();
          }}
          className="space-y-6"
        >
          <RadioGroup
            value={plan}
            onValueChange={setPlan}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {Object.entries(config.PLANS).map(([key, value]) => (
              <Label
                key={key}
                className={`relative flex flex-col items-start p-6 border-2 rounded cursor-pointer transition-all duration-200 hover:border-primary hover:bg-primary/5 ${
                  plan === key ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <RadioGroupItem value={key} className="sr-only" />
                <div className="flex items-center space-x-2">
                  {planIcons[key]}
                  <span className="text-lg font-semibold">{key}</span>
                </div>
                <span className="text-2xl font-bold mb-2">
                  $ {value.planPrice}
                </span>
                <span className="text-sm text-muted-foreground mb-4">
                  {value.headshots} Headshots
                </span>
                {key === "Premium" && (
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary"
                  >
                    <TrendingUp className="size-3 mr-1" strokeWidth={2} />
                    Most Popular Plan.
                  </Badge>
                )}

                {plan === key && (
                  <div className="absolute top-4 right-4 w-5 h-5 rounded border-2 border-primary flex items-center justify-center">
                    <Check className="size-3 text-primary" strokeWidth={4} />
                  </div>
                )}
              </Label>
            ))}
          </RadioGroup>

          <Separator />

          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex gap-1 items-center">
              <span>Quantity</span>
              <ToolTip content={"each unit generates images for one person."} />
            </Label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                <Minus className="size-4" strokeWidth={2} />
              </Button>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) =>
                  handleQuantityChange(parseInt(e.target.value, 10))
                }
                className="w-16 text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleQuantityChange(quantity + 1)}
              >
                <Plus className="size-4" strokeWidth={2} />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>
                ${Math.trunc(quantity * config.PLANS[plan].planPrice)}
              </span>
            </div>
            <Button
              type="submit"
              className="w-full text-base py-6 font-bold leading-tight tracking-tighter rounded lg:leading-[1.1]"
              size="lg"
              disabled={!quantity || pending}
            >
              {pending
                ? "Processing..."
                : `Pay $${Math.trunc(
                    quantity * config.PLANS[plan]["planPrice"]
                  )}`}
            </Button>
            <span className="text-muted-foreground text-sm flex items-center justify-center">
              <ShieldCheck className="mr-2 size-5 text-success" />
              7-days money-back guarantee
            </span>
          </div>
        </form>

        {/* <ReviewsCarousel /> */}
        <div className="mt-6 space-y-2 text-xs text-muted-foreground">
          <p className="flex items-center justify-center">
            After payment, you'll be redirected to create your headshots.
          </p>
          <p className="flex items-center justify-center">
            If you have any discount code your can redeem at next checkout page.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

const ReviewsCarousel = () => {
  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full max-w-4xl"
      plugins={[
        Autoplay({
          delay: 4000,
        }),
      ]}
    >
      <CarouselContent>
        {REVIEWS_ARRAY.filter((review) => review.comment.length > 1).map(
          (review) => (
            <CarouselItem key={review.id}>
              <Card className="bg-transparent border-none shadow-none">
                <CardContent className="p-2">
                  <div className="flex items-center justify-center">
                    <StarRatings size="size-3" rating={review.rating} />
                  </div>
                  <p className="text-sm font-light text-accent-foreground text-center italic my-2">
                    {review.comment}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <Avatar className="h-6 w-6 border border-background">
                      <AvatarImage
                        src={review.avatar}
                        alt={`ai headshot generator review by ${review.name}}`}
                      />
                      <AvatarFallback>{review.name[0]}</AvatarFallback>
                    </Avatar>
                    {/* <span className="text-xs text-muted-foreground">
                      {review.name}
                      {review.position &&
                        review.company &&
                        `, ${review.position} at ${review.company}`}
                      {review.position &&
                        !review.company &&
                        `, ${review.position}`}
                      {!review.position &&
                        !review.company &&
                        ", Proshoot Customer"}
                    </span> */}
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          )
        )}
      </CarouselContent>
    </Carousel>
  );
};
