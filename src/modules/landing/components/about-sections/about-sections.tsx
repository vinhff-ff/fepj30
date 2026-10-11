import paperMap from "../../../../../public/images/pappermap.png";
import missionImage from "../../../../../public/images/bgm23.jpg";
import hoatiet from "../../../../../public/images/hoatiet.png";
import { missionPillars, steamFeatures, teamGroups } from "../../data/content";
import "./about-sections.scss";

function AboutSections() {
  return (
    <div className="landing-about">
      <section
        className="landing-about__section landing-about__section--steam"
        id="steam"
        aria-labelledby="steam-title"
      >
        <div
          className="landing-about__steam-map"
          style={{ backgroundImage: `url("${paperMap.src}")` }}
          aria-hidden="true"
        />
        <div className="landing-about__section-inner">
          <div className="landing-about__heading">
            <div>
              <h2 className="landing-about__title" id="steam-title">
                Steam là gì?
              </h2>
              <p className="landing-about__description">
                Steam là nền tảng phân phối trò chơi của Valve — nơi người
                chơi khám phá, mua và tận hưởng những trải nghiệm game trong
                cùng một thư viện.
              </p>
            </div>
          </div>

          <div className="landing-about__steam-layout">
            <article className="landing-about__steam-card">
              <span className="landing-about__card-label">STEAM / NỀN TẢNG</span>
              <p className="landing-about__steam-card-copy">
                Một nơi để bạn tìm thấy những thế giới mới, giữ lại kỷ niệm cũ
                và luôn có một hành trình tiếp theo để khám phá.
              </p>
              <div className="landing-about__steam-status">
                <span className="landing-about__status-dot" />
                <span>Khám phá · Kết nối · Chơi</span>
              </div>
            </article>

            <div className="landing-about__feature-grid">
              {steamFeatures.map((feature) => (
                <article className="landing-about__feature" key={feature.number}>
                  <span className="landing-about__card-number">{feature.number}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className="landing-about__section landing-about__section--mission landing-about__section--combined"
        id="su-menh"
        aria-labelledby="mission-title"
      >
        <div
          className="landing-about__mission-map"
          style={{ backgroundImage: `url("${missionImage.src}")` }}
          aria-hidden="true"
        />
        <div className="landing-about__section-inner">
          <div className="landing-about__block landing-about__block--mission">
            <div className="landing-about__heading">
              <div>
                <h2 className="landing-about__title" id="mission-title">
                  Sứ mệnh của chúng tôi
                </h2>
                <p className="landing-about__description">
                  Chúng tôi muốn biến mỗi lần mở game thành một hành trình có
                  nghĩa, nơi mọi người có thể tìm thấy niềm vui, sự kết nối và
                  một lý do để quay lại.
                </p>
              </div>
            </div>

            <div className="landing-about__mission-layout">
              <article className="landing-about__mission-statement">
                <span className="landing-about__card-label">CAM KẾT CỦA CHÚNG TÔI</span>
                <p className="landing-about__mission-quote">
                  “Tạo nên một nơi mà mọi người có thể đến để chơi, học hỏi và cùng
                  nhau viết nên những câu chuyện đáng nhớ.”
                </p>
                <div className="landing-about__mission-seal">
                  <strong>STEAM</strong>
                  <span>PLAY / CONNECT / GROW</span>
                </div>
              </article>

              <div className="landing-about__pillar-list">
                {missionPillars.map((pillar) => (
                  <article className="landing-about__pillar" key={pillar.number}>
                    <span className="landing-about__card-number">{pillar.number}</span>
                    <div>
                      <h3>{pillar.title}</h3>
                      <p>{pillar.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="landing-about__block landing-about__block--team" id="doi-ngu">
            <div className="landing-about__heading">
              <div>
                <h2 className="landing-about__title" id="team-title">
                  Đội ngũ của chúng tôi
                </h2>
                <p className="landing-about__description">
                  Chúng tôi là những người yêu game, yêu công nghệ và yêu những
                  câu chuyện được cùng khám phá.
                </p>
              </div>
            </div>

            <div className="landing-about__team-grid">
              {teamGroups.map((group) => (
                <article className="landing-about__team-card" key={group.number}>
                  <div
                    className="landing-about__team-art"
                    style={{ backgroundImage: `url("${hoatiet.src}")` }}
                    aria-hidden="true"
                  />
                  <span className="landing-about__team-number">{group.number}</span>
                  <div className="landing-about__team-content">
                    <h3>{group.title}</h3>
                    <p>{group.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export { AboutSections };
