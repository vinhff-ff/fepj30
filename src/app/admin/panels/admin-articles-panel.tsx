"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  createArticle,
  deleteArticle,
  getArticles,
  updateArticle,
  type CreateArticlePayload,
  type NewsArticle,
  type NewsCategory,
} from "@/modules/news";

const IMAGE_PRESETS = [
  { label: "Phòng STEAM 3D", url: "/images/news-steam-lab.jpg" },
  { label: "Thám hiểm Karst", url: "/images/news-expedition.jpg" },
  { label: "Đại hội Đền Đình", url: "/images/news-festival.jpg" },
  { label: "Trống Đồng & Núi", url: "/images/bgm21.jpg" },
  { label: "Sông Nước Cổ", url: "/images/bgm22.jpg" },
  { label: "Bầu Trời Tinh Tú", url: "/images/bgm23.jpg" },
  { label: "Gốm Men & Làng Nghề", url: "/images/bgm24.jpg" },
];

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminArticlesPanel() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal thêm / sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();

  // Load articles
  async function loadArticles() {
    try {
      setIsLoading(true);
      const data = await getArticles({ limit: 100 });
      setArticles(data.articles);
    } catch {
      message.error("Không thể tải danh sách bài viết.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadArticles();
  }, []);

  // Lọc bài viết
  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const matchCat = categoryFilter === "all" || a.category === categoryFilter;
      const matchSearch =
        !searchFilter.trim() ||
        a.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        a.author.toLowerCase().includes(searchFilter.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [articles, categoryFilter, searchFilter]);

  // Mở modal tạo mới
  const handleOpenCreateModal = () => {
    setEditingArticle(null);
    form.resetFields();
    form.setFieldsValue({
      category: "TIN TỨC",
      author: "Ban Biên Tập",
      authorRole: "Chuyên gia Khảo cứu",
      readTime: "5 phút đọc",
      coverImage: "/images/news-steam-lab.jpg",
      featured: false,
      hot: false,
      tier: 3,
      tagsString: "STEAM, Khảo cứu",
    });
    setIsModalOpen(true);
  };

  // Mở modal chỉnh sửa
  const handleOpenEditModal = (article: NewsArticle) => {
    setEditingArticle(article);
    form.resetFields();
    form.setFieldsValue({
      title: article.title,
      slug: article.slug,
      category: article.category,
      author: article.author,
      authorRole: article.authorRole,
      readTime: article.readTime,
      coverImage: article.coverImage,
      excerpt: article.excerpt,
      content: article.content,
      featured: article.featured,
      hot: article.hot,
      tier: article.tier ?? 3,
      tagsString: article.tags?.join(", ") || "",
    });
    setIsModalOpen(true);
  };

  // Submit Modal
  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);

      const parsedTags = values.tagsString
        ? values.tagsString
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean)
        : [];

      const payload: CreateArticlePayload = {
        title: values.title.trim(),
        slug: values.slug.trim(),
        category: values.category as NewsCategory,
        author: values.author.trim(),
        authorRole: values.authorRole.trim(),
        readTime: values.readTime.trim(),
        coverImage: values.coverImage.trim(),
        excerpt: values.excerpt.trim(),
        content: values.content.trim(),
        featured: Boolean(values.featured),
        hot: Boolean(values.hot),
        tier: Number(values.tier) || 3,
        tags: parsedTags,
      };

      if (editingArticle && editingArticle.id) {
        const updated = await updateArticle(editingArticle.id, payload);
        message.success(`Đã cập nhật bài viết "${updated.title}" thành công!`);
      } else {
        const created = await createArticle(payload);
        message.success(`Đã xuất bản bài viết "${created.title}" thành công!`);
      }

      await loadArticles();
      setIsModalOpen(false);
      form.resetFields();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errorFields" in err) {
        return;
      }
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Thao tác thất bại";
      message.error(msg || "Có lỗi xảy ra khi lưu bài viết.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xóa bài viết
  const handleDeleteArticle = async (article: NewsArticle) => {
    if (!article.id) return;
    try {
      await deleteArticle(article.id);
      setArticles((prev) => prev.filter((a) => a.id !== article.id));
      message.success(`Đã xóa bài viết "${article.title}".`);
    } catch {
      message.error("Xóa bài viết thất bại.");
    }
  };

  // Columns Antd Table
  const columns: ColumnsType<NewsArticle> = [
    {
      title: "Ảnh bìa",
      dataIndex: "coverImage",
      key: "coverImage",
      width: 75,
      render: (img: string, record) => (
        <div style={{ width: 50, height: 38, position: "relative", borderRadius: 4, overflow: "hidden", border: "1px solid #e2e8f0" }}>
          <Image src={img || "/images/news-steam-lab.jpg"} alt={record.title} fill sizes="50px" style={{ objectFit: "cover" }} unoptimized />
        </div>
      ),
    },
    {
      title: "Tiêu đề & Đường dẫn",
      dataIndex: "title",
      key: "title",
      render: (title: string, record) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>/{record.slug}</div>
        </div>
      ),
    },
    {
      title: "Chuyên mục",
      dataIndex: "category",
      key: "category",
      width: 130,
      render: (cat: string) => {
        let color = "blue";
        if (cat === "KHÁM PHÁ") color = "gold";
        if (cat === "SỰ KIỆN") color = "magenta";
        if (cat === "HƯỚNG DẪN") color = "cyan";
        return <Tag color={color} style={{ fontWeight: 700 }}>{cat}</Tag>;
      },
    },
    {
      title: "Tác giả",
      dataIndex: "author",
      key: "author",
      width: 140,
      render: (author: string, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{author}</div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>{record.readTime}</div>
        </div>
      ),
    },
    {
      title: "Cấp hiển thị",
      dataIndex: "tier",
      key: "tier",
      width: 145,
      render: (tier: number = 3) => {
        if (tier === 1) return <Tag color="red" style={{ fontWeight: 800 }}>⭐ CẤP 1 (Lớn nhất)</Tag>;
        if (tier === 2) return <Tag color="blue" style={{ fontWeight: 700 }}>📌 CẤP 2 (Bên cạnh)</Tag>;
        return <Tag color="default" style={{ fontWeight: 600 }}>📄 CẤP 3 (Dưới cùng)</Tag>;
      },
    },
    {
      title: "Nhãn",
      key: "badges",
      width: 130,
      render: (_, record) => (
        <Space size={4} wrap>
          {record.featured && <Tag color="volcano">NỔI BẬT</Tag>}
          {record.hot && <Tag color="red">HOT</Tag>}
          {!record.featured && !record.hot && <span style={{ color: "#94a3b8" }}>—</span>}
        </Space>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (date: string) => (
        <span style={{ fontSize: 12, color: "#64748b" }}>
          {new Date(date).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 140,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenEditModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa bài viết"
            description={`Bạn có chắc muốn xóa bài viết "${record.title}"?`}
            onConfirm={() => handleDeleteArticle(record)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-table-container">
      <div className="admin-table-container__header">
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <h3 className="admin-table-container__title">
            Danh sách bài viết tin tức ({articles.length})
          </h3>
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: 140 }}
            options={[
              { value: "all", label: "Tất cả mục" },
              { value: "TIN TỨC", label: "Tin tức" },
              { value: "KHÁM PHÁ", label: "Khám phá" },
              { value: "SỰ KIỆN", label: "Sự kiện" },
              { value: "HƯỚNG DẪN", label: "Hướng dẫn" },
            ]}
          />
          <Input
            placeholder="Tìm kiếm bài viết..."
            prefix={<SearchOutlined />}
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            style={{ width: 220 }}
            allowClear
          />
        </div>

        {/* NÚT THÊM MỚI Ở GÓC PHÍA TRÊN BÊN PHẢI */}
        <div className="admin-table-container__actions">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreateModal}
            size="middle"
          >
            Thêm mới bài viết
          </Button>
        </div>
      </div>

      <Table<NewsArticle>
        columns={columns}
        dataSource={filteredArticles}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize: 12,
          showSizeChanger: true,
          pageSizeOptions: ["10", "12", "20", "50"],
          showTotal: (total) => `Tổng cộng ${total} bài viết`,
        }}
        scroll={{ x: 950, y: "calc(100vh - 290px)" }}
        style={{ width: "100%" }}
      />

      {/* MODAL ANTD: THÊM MỚI / CHỈNH SỬA BÀI VIẾT */}
      <Modal
        title={editingArticle ? `Chỉnh sửa bài viết: ${editingArticle.title}` : "Thêm mới bài viết tin tức"}
        open={isModalOpen}
        onOk={handleModalSubmit}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={isSubmitting}
        okText={editingArticle ? "Cập nhật" : "Xuất bản"}
        cancelText="Hủy"
        width={760}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="title"
            label="Tiêu đề bài viết"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề bài viết" }]}
          >
            <Input
              placeholder="Ví dụ: Lễ hội Khám phá STEAM Cổ truyền..."
              onChange={(e) => {
                if (!editingArticle) {
                  form.setFieldValue("slug", slugify(e.target.value));
                }
              }}
            />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Đường dẫn tĩnh (Slug)"
            rules={[{ required: true, message: "Vui lòng nhập slug" }]}
          >
            <Input placeholder="le-hoi-kham-pha-steam-co-truyen" />
          </Form.Item>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Form.Item
              name="category"
              label="Chuyên mục"
              rules={[{ required: true, message: "Vui lòng chọn chuyên mục" }]}
            >
              <Select
                options={[
                  { value: "TIN TỨC", label: "TIN TỨC" },
                  { value: "KHÁM PHÁ", label: "KHÁM PHÁ" },
                  { value: "SỰ KIỆN", label: "SỰ KIỆN" },
                  { value: "HƯỚNG DẪN", label: "HƯỚNG DẪN" },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="author"
              label="Tác giả"
              rules={[{ required: true, message: "Vui lòng nhập tên tác giả" }]}
            >
              <Input placeholder="Ban Biên Tập" />
            </Form.Item>

            <Form.Item
              name="readTime"
              label="Thời gian đọc"
              rules={[{ required: true, message: "Vui lòng nhập thời gian đọc" }]}
            >
              <Input placeholder="5 phút đọc" />
            </Form.Item>
          </div>

          <Form.Item
            name="coverImage"
            label="Ảnh bìa bài viết (URL)"
            rules={[{ required: true, message: "Vui lòng nhập ảnh bìa" }]}
          >
            <Input placeholder="/images/... hoặc https://..." />
          </Form.Item>

          <div style={{ marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6 }}>
              Ảnh gợi ý có sẵn:
            </span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {IMAGE_PRESETS.map((p) => (
                <Tag
                  key={p.url}
                  color="blue"
                  style={{ cursor: "pointer" }}
                  onClick={() => form.setFieldValue("coverImage", p.url)}
                >
                  {p.label}
                </Tag>
              ))}
            </div>
          </div>

          <Form.Item
            name="excerpt"
            label="Đoạn tóm tắt ngắn (Excerpt)"
            rules={[{ required: true, message: "Vui lòng nhập tóm tắt bài viết" }]}
          >
            <Input.TextArea rows={2} placeholder="Tóm tắt ngắn gọn hiển thị ngoài danh sách tin..." />
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung bài viết"
            rules={[{ required: true, message: "Vui lòng nhập nội dung bài viết" }]}
          >
            <Input.TextArea rows={5} placeholder="Nội dung chi tiết của bài viết..." />
          </Form.Item>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Form.Item
              name="tier"
              label="Cấp hiển thị (Tier)"
              tooltip="Cấp 1: Bài lớn nhất; Cấp 2: Bài bên cạnh (tối đa 5 bài); Cấp 3: Bài dưới cùng. Khi gán Cấp 1, bài Cấp 1 hiện tại sẽ tự động bị đẩy xuống Cấp 2. Nếu Cấp 2 quá 5 bài sẽ tự động đẩy xuống Cấp 3."
            >
              <Select
                options={[
                  { value: 1, label: "⭐ Cấp 1 (Bài lớn nhất)" },
                  { value: 2, label: "📌 Cấp 2 (Bên cạnh, max 5)" },
                  { value: 3, label: "📄 Cấp 3 (Dưới cùng)" },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="featured"
              label="Đánh dấu NỔI BẬT"
              valuePropName="checked"
            >
              <Switch checkedChildren="BẬT" unCheckedChildren="TẮT" />
            </Form.Item>

            <Form.Item
              name="hot"
              label="Đánh dấu HOT"
              valuePropName="checked"
            >
              <Switch checkedChildren="BẬT" unCheckedChildren="TẮT" />
            </Form.Item>
          </div>

          <Form.Item name="tagsString" label="Thẻ bài viết (Tags, cách nhau bằng dấu phẩy)">
            <Input placeholder="STEAM, Khảo cứu, Văn hóa" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
