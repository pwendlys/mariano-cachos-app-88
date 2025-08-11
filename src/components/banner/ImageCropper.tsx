
import React from "react";
import Cropper from "react-easy-crop";
import { Slider } from "@/components/ui/slider";

type Props = {
  image: string;
  crop: { x: number; y: number };
  zoom: number;
  aspect?: number;
  onCropChange: (c: { x: number; y: number }) => void;
  onZoomChange: (z: number) => void;
  className?: string;
};

const ImageCropper: React.FC<Props> = ({
  image,
  crop,
  zoom,
  aspect = 2,
  onCropChange,
  onZoomChange,
  className,
}) => {
  return (
    <div className={className ?? ""}>
      <div className="relative w-full rounded-lg overflow-hidden border border-salon-gold/20" style={{ height: 240 }}>
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          showGrid={false}
          restrictPosition={false}
          zoomWithScroll
          classes={{
            containerClassName: "bg-salon-dark/60",
            mediaClassName: "select-none",
          }}
        />
      </div>
      <div className="mt-3">
        <label className="block text-sm text-muted-foreground mb-1">Zoom</label>
        <Slider
          value={[zoom]}
          onValueChange={(v) => onZoomChange(v[0] || 1)}
          min={1}
          max={3}
          step={0.05}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default ImageCropper;
