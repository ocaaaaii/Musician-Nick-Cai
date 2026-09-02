import { Hero } from "@/components/home/Hero";
import { About } from "@/components/home/About";
import { FeaturedVideos } from "@/components/home/FeaturedVideos";
import { SocialFooter } from "@/components/home/SocialFooter";
import { Reveal } from "@/components/ui/Reveal";
import { getProfileConfig } from "@/lib/content/profile";
import { getFeaturedVideos } from "@/lib/content/featured-videos";

export default async function Home() {
  const [profile, videos] = await Promise.all([
    getProfileConfig(),
    getFeaturedVideos(),
  ]);

  return (
    <main>
      <Hero profile={profile} />
      <Reveal>
        <About profile={profile} />
      </Reveal>
      <Reveal>
        <FeaturedVideos videos={videos} />
      </Reveal>
      <Reveal>
        <SocialFooter profile={profile} />
      </Reveal>
    </main>
  );
}
