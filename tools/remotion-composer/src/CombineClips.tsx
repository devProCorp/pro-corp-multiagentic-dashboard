import { AbsoluteFill, OffthreadVideo, Series, staticFile } from "remotion";

type Clip = {
  src: string; // filename, served via staticFile
  durationInFrames: number;
};

type Props = {
  clips: Clip[];
};

export const CombineClips: React.FC<Props> = ({ clips }) => {
  if (clips.length === 0) {
    return (
      <AbsoluteFill style={{ backgroundColor: "black", justifyContent: "center", alignItems: "center" }}>
        <span style={{ color: "white", fontSize: 48 }}>No clips loaded</span>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Series>
        {clips.map((clip, i) => (
          <Series.Sequence key={i} durationInFrames={clip.durationInFrames}>
            <AbsoluteFill>
              <OffthreadVideo
                src={staticFile(clip.src)}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </AbsoluteFill>
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
