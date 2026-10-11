interface FeatureItem {
  number: string;
  title: string;
  description: string;
}

const steamFeatures: readonly FeatureItem[] = [
  {
    number: "01",
    title: "Một thư viện duy nhất",
    description:
      "Gom những trải nghiệm bạn yêu thích vào cùng một nơi để luôn sẵn sàng khám phá.",
  },
  {
    number: "02",
    title: "Sẵn sàng chơi ngay",
    description:
      "Khởi động game nhanh, liên tục và tận hưởng khoảnh khắc bạn cần.",
  },
  {
    number: "03",
    title: "Kết nối cộng đồng",
    description:
      "Chia sẻ hành trình, tìm bạn đồng hành và cùng nhau viết nên câu chuyện mới.",
  },
];

const missionPillars: readonly FeatureItem[] = [
  {
    number: "01",
    title: "Gần gũi",
    description: "Mọi trải nghiệm đều dễ tiếp cận, rõ ràng và thân thiện.",
  },
  {
    number: "02",
    title: "Đáng tin cậy",
    description: "Chất lượng và sự an toàn luôn là tiêu chuẩn cho mỗi khoảnh khắc.",
  },
  {
    number: "03",
    title: "Cùng nhau",
    description: "Một cộng đồng đam mê là nơi mọi câu chuyện thực sự bắt đầu.",
  },
];

const teamGroups: readonly FeatureItem[] = [
  {
    number: "01",
    title: "Đội ngũ sáng tạo",
    description:
      "Biến những ý tưởng tách biệt thành thế giới giàu màu sắc và có chiều sâu.",
  },
  {
    number: "02",
    title: "Đội ngũ phát triển",
    description:
      "Xây dựng trải nghiệm ổn định, mượt mà để người chơi tập trung vào niềm vui.",
  },
  {
    number: "03",
    title: "Đội ngũ cộng đồng",
    description:
      "Lắng nghe, kết nối và đồng hành cùng cộng đồng trên từng hành trình.",
  },
  {
    number: "04",
    title: "Đội ngũ vận hành",
    description:
      "Giữ mọi trải nghiệm luôn minh bạch, an toàn và sẵn sàng cho hành trình tiếp theo.",
  },
];

export { missionPillars, steamFeatures, teamGroups };
export type { FeatureItem };
