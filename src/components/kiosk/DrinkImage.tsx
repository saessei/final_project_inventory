import { useState } from "react";
import placeholderImg from "@/assets/Placeholder.jpg";

interface DrinkImageProps {
  imageUrl: string;
  name: string;
}

export const DrinkImage = ({ imageUrl, name }: DrinkImageProps) => {
  const [imageError, setImageError] = useState(false);

  const getImageSrc = () => {
    if (imageError) return placeholderImg;
    if (imageUrl && imageUrl.trim() !== "") return imageUrl;
    return placeholderImg;
  };

  return (
    <img
      src={getImageSrc()}
      alt={name}
      className="h-44 w-full shrink-0 object-cover rounded-2xl group-hover:scale-110 transition-transform duration-500"
      onError={() => setImageError(true)}
    />
  );
};
