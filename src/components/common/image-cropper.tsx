import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { CropIcon, Trash2Icon } from "lucide-react";
import { type SyntheticEvent, useRef, useState } from "react";
import ReactCrop, { centerCrop, makeAspectCrop, type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

type Props = {
  imageUrl: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ImageCropper = ({ imageUrl, onCropComplete, onCancel, dialogOpen, setDialogOpen }: Props) => {
  // const [isDialogOpen, setIsDialogOpen] = useState(false);
  const aspect = 1;
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [croppedImageUrl, setCroppedImageUrl] = useState("");

  const onImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  };

  const onCropCompleted = (crop: PixelCrop) => {
    if (imgRef.current && crop.width && crop.height) {
      const croppedImageUrl = getCroppedImg(imgRef.current, crop);
      setCroppedImageUrl(croppedImageUrl);
    }
  };

  const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop): string => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY
      );
    }

    return canvas.toDataURL("image/png", 1.0);
  };

  const handleCrop = () => {
    try {
      onCropComplete(croppedImageUrl);
      setDialogOpen(false);
    } catch (_error) {}
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger>
        <Avatar className='size-25 cursor-pointer ring-2 ring-slate-200 ring-offset-2'>
          <AvatarImage src={imageUrl} alt='icon' />
          <AvatarFallback>Icon</AvatarFallback>
        </Avatar>
      </DialogTrigger>
      <DialogContent
        className='gap-0 p-0'
        closeClassName='hidden'
        overlayClassName='bg-black/50'
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <div className='flex size-full justify-center p-6'>
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => onCropCompleted(c)}
            aspect={aspect}
          >
            <Avatar className='size-full rounded-none'>
              <AvatarImage
                ref={imgRef}
                className='aspect-auto size-full max-h-115 rounded-none'
                alt='Image Cropper Shell'
                src={imageUrl}
                onLoad={onImageLoad}
              />
              <AvatarFallback className='size-115 rounded-none bg-transparent'>Loading...</AvatarFallback>
            </Avatar>
          </ReactCrop>
        </div>
        <DialogFooter className='justify-center p-6 pt-0'>
          <DialogClose asChild>
            <Button size='sm' type='reset' className='w-fit' variant='outline' onClick={onCancel}>
              <Trash2Icon className='mr-1.5 size-4' />
              Cancel
            </Button>
          </DialogClose>
          <Button type='button' size='sm' className='w-fit' onClick={handleCrop}>
            <CropIcon className='mr-1.5 size-4' />
            Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const centerAspectCrop = (mediaWidth: number, mediaHeight: number, aspect: number): Crop => {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 50,
        height: 50
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
};
