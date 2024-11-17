import React from "react";

const starRatingIcons = {
  fullStarIcon: (size) => (
    <svg
      height="21px"
      viewBox="0 0 20 21"
      width="20px"
      xmlns="http://www.w3.org/2000/svg"
      className={`${size} text-muted fill-muted`}
    >
      <g fill="currentColor">
        <path d="M10,15.273 L16.18,19 L14.545,11.971 L20,7.244 L12.809,6.627 L10,0 L7.191,6.627 L0,7.244 L5.455,11.971 L3.82,19 L10,15.273 Z" />
      </g>
    </svg>
  ),
  halfStarIcon: (size) => (
    <svg
      height="21px"
      viewBox="0 0 20 21"
      width="20px"
      xmlns="http://www.w3.org/2000/svg"
      className={`${size} text-muted fill-muted`}
    >
      <defs>
        <clipPath id="halfStarClip">
          <rect x="0" y="0" width="10" height="21" />
        </clipPath>
      </defs>
      <g fill="currentColor">
        <path
          d="M10,15.273 L16.18,19 L14.545,11.971 L20,7.244 L12.809,6.627 L10,0 L7.191,6.627 L0,7.244 L5.455,11.971 L3.82,19 L10,15.273 Z"
          clipPath="url(#halfStarClip)"
        />
      </g>
    </svg>
  ),
  emptyStarIcon: (size) => (
    <svg
      height="21px"
      viewBox="0 0 20 21"
      width="20px"
      xmlns="http://www.w3.org/2000/svg"
      className={`${size} text-muted fill-muted`}
    >
      <g fill="currentColor" opacity="0.2">
        <path d="M10,15.273 L16.18,19 L14.545,11.971 L20,7.244 L12.809,6.627 L10,0 L7.191,6.627 L0,7.244 L5.455,11.971 L3.82,19 L10,15.273 Z" />
      </g>
    </svg>
  ),
};

function StarRatings({ rating = 5, size = "size-5" }) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const isFull = rating >= i + 1;
    const isHalf = !isFull && rating >= i + 0.5;

    if (isFull) return starRatingIcons.fullStarIcon(size);
    if (isHalf) return starRatingIcons.halfStarIcon(size);
    return starRatingIcons.emptyStarIcon(size);
  });

  const backgroundColor =
    rating >= 4 ? "bg-success" : rating >= 2 ? "bg-yellow-500" : "bg-red-600";

  return (
    <div className={`flex gap-1`}>
      {stars.map((star, index) => (
        <span key={index} className={`${backgroundColor} p-1`}>
          {star}
        </span>
      ))}
    </div>
  );
}

export default StarRatings;
