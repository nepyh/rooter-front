import { Composition } from "remotion";
import { PROMO_DURATION, RooterPromo } from "./rooter/RooterPromo";
import { PROMO_H_DURATION, RooterPromoH } from "./rooter/RooterPromoH";
import { BugPoster } from "./rooter/BugPoster";
import { AndroidPoster } from "./rooter/AndroidPoster";
import { EventPoster, EventStory } from "./rooter/EventPoster";
import { SurveyPoster, SurveyStory } from "./rooter/SurveyPoster";
import { NotionBanner } from "./rooter/NotionBanner";
import { GRID_H, GRID_W, NotionBannerGrid } from "./rooter/NotionBannerGrid";
import { NotionBannerWide, WIDE_BANNERS, WIDE_H, WIDE_W } from "./rooter/NotionBannerWide";
import { A4_BANNERS, NotionBannerA4 } from "./rooter/NotionBannerA4";
import { NOTION_CANDIDATES, NotionCollabBanner, SOLID_CANDIDATES, SolidBanner } from "./rooter/NotionBannerCandidates";
import { Thumbnail, Thumbnail2, Thumbnail3, Thumbnail4, Thumbnail5 } from "./rooter/Thumbnail";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="RooterPromo"
        component={RooterPromo}
        durationInFrames={PROMO_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="RooterPromoH"
        component={RooterPromoH}
        durationInFrames={PROMO_H_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition id="NotionBanner" component={NotionBanner} durationInFrames={1} fps={30} width={1500} height={600} />
      <Composition id="BannerGrid-Light" component={NotionBannerGrid} defaultProps={{ mode: "light" as const }} durationInFrames={1} fps={30} width={GRID_W} height={GRID_H} />
      <Composition id="BannerGrid-Dark" component={NotionBannerGrid} defaultProps={{ mode: "dark" as const }} durationInFrames={1} fps={30} width={GRID_W} height={GRID_H} />
      {WIDE_BANNERS.map((b) => (
        <Composition key={b.id} id={b.id} component={NotionBannerWide} defaultProps={b.props} durationInFrames={1} fps={30} width={WIDE_W} height={WIDE_H} />
      ))}
      {A4_BANNERS.map((b) => (
        <Composition key={b.id} id={b.id} component={NotionBannerA4} defaultProps={b.props} durationInFrames={1} fps={30} width={1500} height={600} />
      ))}
      {SOLID_CANDIDATES.map((b) => (
        <Composition key={b.id} id={b.id} component={SolidBanner} defaultProps={b.props} durationInFrames={1} fps={30} width={1500} height={600} />
      ))}
      {NOTION_CANDIDATES.map((b) => (
        <Composition key={b.id} id={b.id} component={NotionCollabBanner} defaultProps={b.props} durationInFrames={1} fps={30} width={1500} height={600} />
      ))}
      <Composition id="SurveyPoster" component={SurveyPoster} durationInFrames={1} fps={30} width={1080} height={1350} />
      <Composition id="SurveyStory" component={SurveyStory} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="EventPoster" component={EventPoster} durationInFrames={1} fps={30} width={1080} height={1350} />
      <Composition id="EventStory" component={EventStory} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="AndroidPoster" component={AndroidPoster} durationInFrames={1} fps={30} width={1080} height={1350} />
      <Composition id="BugPoster" component={BugPoster} durationInFrames={1} fps={30} width={1080} height={1350} />
      <Composition id="Thumbnail" component={Thumbnail} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="Thumbnail2" component={Thumbnail2} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="Thumbnail3" component={Thumbnail3} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="Thumbnail4" component={Thumbnail4} durationInFrames={1} fps={30} width={1080} height={1920} />
      <Composition id="Thumbnail5" component={Thumbnail5} durationInFrames={1} fps={30} width={1080} height={1920} />
    </>
  );
};
