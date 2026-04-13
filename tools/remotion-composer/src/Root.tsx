import { Composition } from "remotion";
import { CombineClips } from "./CombineClips";

export const Root: React.FC = () => {
  return (
    <Composition
      id="CombineClips"
      component={CombineClips}
      durationInFrames={900} // placeholder, overridden at render time
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        clips: [],
      }}
    />
  );
};
