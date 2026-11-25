import React from "react";
import { Composition } from "remotion";
import { Video, totalFrames, FPS } from "./Video";

export const Root: React.FC = () => (
  <Composition
    id="Video"
    component={Video}
    durationInFrames={totalFrames}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
