"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  ShoppingOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import {
  createShopItem,
  deleteShopItem,
  getAdminOrders,
  getShopItems,
  updateOrderStatus,
  updateShopItem,
  type CreateShopItemPayload,
  type ShopItem,
  type ShopOrder,
  type UpdateShopItemPayload,
} from "@/modules/shop";

const { Text } = Typography;

// Các ảnh mẫu có sẵn trong hệ thống để Admin chọn nhanh
const SUGGESTED_IMAGES = [
  { label: "Mặt nạ Lễ hội", url: "/items/mask_matla.png" },
  { label: "Kính Tri thức", url: "/items/glasses_kinh.png" },
  { label: "Mũ Vành tròn", url: "/items/hat_circle.webp" },
  { label: "Mũ Lưỡi trai", url: "/items/hat_cap.webp" },
  { label: "Quà STEAM Lab", url: "/images/news-steam-lab.jpg" },
  { label: "Bộ Dã ngoại", url: "/images/news-expedition.jpg" },
  { label: "Lễ hội Khoa học", url: "/images/news-festival.jpg" },
  { label: "Avatar Chuột", url: "/images/chuotuser.png" },
];

export function AdminShopPanel() {
  const [subTab, setSubTab] = useState<"items" | "orders">("items");

  // State danh sách sản phẩm
  const [items, setItems] = useState<ShopItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [itemSearch, setItemSearch] = useState("");

  // Modal thêm / sửa sản phẩm
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);
  const [form] = Form.useForm();

  // State đơn hàng
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [orderSearch, setOrderSearch] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Load items
  async function loadItems() {
    try {
      setIsLoadingItems(true);
      const data = await getShopItems({ all: true });
      setItems(data);
    } catch {
      message.error("Không thể tải danh sách sản phẩm.");
    } finally {
      setIsLoadingItems(false);
    }
  }

  // Load orders
  async function loadOrders() {
    try {
      setIsLoadingOrders(true);
      const res = await getAdminOrders({
        status: orderStatusFilter === "ALL" ? undefined : orderStatusFilter,
        search: orderSearch.trim() || undefined,
      });
      setOrders(res.orders);
    } catch {
      message.error("Không thể tải danh sách đơn hàng.");
    } finally {
      setIsLoadingOrders(false);
    }
  }

  useEffect(() => {
    void loadItems();
    void loadOrders();
  }, []);

  useEffect(() => {
    if (subTab === "orders") {
      void loadOrders();
    }
  }, [subTab, orderStatusFilter]);

  // Lọc sản phẩm theo tìm kiếm
  const filteredItems = useMemo(() => {
    if (!itemSearch.trim()) return items;
    const q = itemSearch.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
    );
  }, [items, itemSearch]);

  // Mở modal tạo mới
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({
      imageUrl: "/images/news-steam-lab.jpg",
      coinPrice: 10,
      isSpecial: false,
      stock: undefined,
    });
    setIsItemModalOpen(true);
  };

  // Mở modal chỉnh sửa
  const handleOpenEditModal = (item: ShopItem) => {
    setEditingItem(item);
    form.resetFields();
    form.setFieldsValue({
      name: item.name,
      description: item.description || "",
      imageUrl: item.imageUrl,
      coinPrice: item.coinPrice,
      isSpecial: item.isSpecial,
      stock: item.stock === null ? undefined : item.stock,
    });
    setIsItemModalOpen(true);
  };

  // Submit Modal Thêm / Sửa sản phẩm
  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmittingItem(true);

      const payload: CreateShopItemPayload | UpdateShopItemPayload = {
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        imageUrl: values.imageUrl.trim(),
        coinPrice: Number(values.coinPrice),
        isSpecial: Boolean(values.isSpecial),
        stock: values.stock === undefined || values.stock === null || values.stock === "" ? null : Number(values.stock),
      };

      if (editingItem) {
        const updated = await updateShopItem(editingItem.id, payload);
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
        message.success(`Đã cập nhật sản phẩm "${updated.name}" thành công!`);
      } else {
        const created = await createShopItem(payload as CreateShopItemPayload);
        setItems((prev) => [created, ...prev]);
        message.success(`Đã thêm mới sản phẩm "${created.name}" thành công!`);
      }

      setIsItemModalOpen(false);
      form.resetFields();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errorFields" in err) {
        return; // Validation errors handled by antd
      }
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Thao tác thất bại";
      message.error(msg || "Có lỗi xảy ra.");
    } finally {
      setIsSubmittingItem(false);
    }
  };

  // Xóa sản phẩm
  const handleDeleteItem = async (item: ShopItem) => {
    try {
      await deleteShopItem(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      message.success(`Đã xóa sản phẩm "${item.name}".`);
    } catch {
      message.error("Xóa sản phẩm thất bại.");
    }
  };

  // Cập nhật trạng thái đơn hàng
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((ord) => (ord.id === orderId ? updated : ord)));
      message.success("Đã cập nhật trạng thái đơn hàng!");
    } catch {
      message.error("Cập nhật trạng thái thất bại.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Cấu hình cột bảng Sản phẩm (Antd Table)
  const itemColumns: ColumnsType<ShopItem> = [
    {
      title: "Ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 70,
      render: (url: string, record) => (
        <div style={{ width: 44, height: 44, position: "relative", borderRadius: 6, overflow: "hidden", border: "1px solid #e2e8f0" }}>
          <Image
            src={url || "/images/news-steam-lab.jpg"}
            alt={record.name}
            fill
            sizes="44px"
            style={{ objectFit: "cover" }}
            unoptimized
          />
        </div>
      ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (name: string, record) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{name}</div>
          {record.description && (
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{record.description}</div>
          )}
        </div>
      ),
    },
    {
      title: "Giá xu",
      dataIndex: "coinPrice",
      key: "coinPrice",
      width: 120,
      sorter: (a, b) => a.coinPrice - b.coinPrice,
      render: (price: number) => (
        <span style={{ fontWeight: 800, color: "#b45309" }}>🪙 {price.toLocaleString("vi-VN")} Xu</span>
      ),
    },
    {
      title: "Phân loại",
      dataIndex: "isSpecial",
      key: "isSpecial",
      width: 140,
      filters: [
        { text: "⭐ ĐẶC BIỆT", value: true },
        { text: "Thường", value: false },
      ],
      onFilter: (value, record) => record.isSpecial === value,
      render: (isSpecial: boolean) =>
        isSpecial ? (
          <Tag color="gold" style={{ fontWeight: 700 }}>
            ⭐ ĐẶC BIỆT
          </Tag>
        ) : (
          <Tag color="default">Vật phẩm thường</Tag>
        ),
    },
    {
      title: "Tồn kho",
      dataIndex: "stock",
      key: "stock",
      width: 110,
      render: (stock: number | null) =>
        stock === null ? (
          <Tag color="blue">Vô hạn</Tag>
        ) : (
          <Tag color={stock > 0 ? "green" : "red"}>{stock.toLocaleString("vi-VN")}</Tag>
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
            title="Xác nhận xóa"
            description={`Bạn có chắc muốn xóa "${record.name}" khỏi cửa hàng?`}
            onConfirm={() => handleDeleteItem(record)}
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

  // Cấu hình cột bảng Đơn hàng (Antd Table)
  const orderColumns: ColumnsType<ShopOrder> = [
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date: string) => (
        <span style={{ fontSize: 12, color: "#64748b" }}>
          {new Date(date).toLocaleString("vi-VN")}
        </span>
      ),
    },
    {
      title: "Người mua",
      dataIndex: ["user", "username"],
      key: "username",
      width: 140,
      render: (_, record) => (
        <span style={{ fontWeight: 700 }}>{record.user?.username || record.userId}</span>
      ),
    },
    {
      title: "Vật phẩm",
      key: "item",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {record.item?.imageUrl && (
            <div style={{ width: 36, height: 36, position: "relative", borderRadius: 4, overflow: "hidden", border: "1px solid #e2e8f0", flexShrink: 0 }}>
              <Image src={record.item.imageUrl} alt="" fill sizes="36px" style={{ objectFit: "cover" }} unoptimized />
            </div>
          )}
          <div>
            <div style={{ fontWeight: 700 }}>
              {record.item?.name || "Vật phẩm"}
              {record.isSpecial && (
                <Tag color="gold" style={{ marginLeft: 6, fontSize: 10 }}>
                  ⭐ ĐẶC BIỆT
                </Tag>
              )}
            </div>
            {record.note && (
              <div style={{ fontSize: 12, color: "#64748b", fontStyle: "italic", marginTop: 2 }}>
                Ghi chú: {record.note}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Giá trừ",
      dataIndex: "coinPrice",
      key: "coinPrice",
      width: 100,
      render: (price: number) => (
        <span style={{ fontWeight: 800, color: "#b45309" }}>🪙 {price}</span>
      ),
    },
    {
      title: "Thông tin liên lạc đã gửi",
      dataIndex: "contactInfo",
      key: "contactInfo",
      width: 250,
      render: (contact: string | null) =>
        contact ? (
          <div style={{ background: "#fefce8", border: "1px solid #facc15", padding: "4px 8px", borderRadius: 4 }}>
            <Text copyable style={{ fontSize: 13, fontWeight: 700, color: "#854d0e" }}>
              {contact}
            </Text>
          </div>
        ) : (
          <span style={{ color: "#94a3b8" }}>— (Không có)</span>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: string) => {
        switch (status) {
          case "PENDING":
            return <Tag color="warning">Chờ xử lý</Tag>;
          case "PROCESSING":
            return <Tag color="processing">Đang xử lý</Tag>;
          case "COMPLETED":
            return <Tag color="success">Đã hoàn thành</Tag>;
          case "CANCELLED":
            return <Tag color="error">Đã hủy</Tag>;
          default:
            return <Tag>{status}</Tag>;
        }
      },
    },
    {
      title: "Thao tác xử lý",
      key: "action",
      width: 170,
      fixed: "right",
      render: (_, record) => (
        <Select
          size="small"
          value={record.status}
          loading={updatingOrderId === record.id}
          disabled={updatingOrderId === record.id}
          onChange={(newVal) => handleStatusChange(record.id, newVal)}
          style={{ width: "100%" }}
          options={[
            { value: "PENDING", label: "Chờ xử lý" },
            { value: "PROCESSING", label: "Đang xử lý" },
            { value: "COMPLETED", label: "Đã hoàn thành" },
            { value: "CANCELLED", label: "Đã hủy" },
          ]}
        />
      ),
    },
  ];

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* THANH CHUYỂN TAB CON (SẢN PHẨM / ĐƠN HÀNG) */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid #e2e8f0", paddingBottom: 8 }}>
        <Button
          type={subTab === "items" ? "primary" : "default"}
          icon={<ShoppingOutlined />}
          onClick={() => setSubTab("items")}
        >
          Danh sách sản phẩm ({items.length})
        </Button>
        <Button
          type={subTab === "orders" ? "primary" : "default"}
          icon={<InboxOutlined />}
          onClick={() => setSubTab("orders")}
        >
          Đơn hàng của người dùng ({orders.length})
        </Button>
      </div>

      {/* ======================================================== */}
      {/* 1. VIEW DANH SÁCH SẢN PHẨM (TABLE ANTD FULL MÀN HÌNH)      */}
      {/* ======================================================== */}
      {subTab === "items" && (
        <div className="admin-table-container">
          <div className="admin-table-container__header">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <h3 className="admin-table-container__title">Quản lý vật phẩm cửa hàng ({items.length})</h3>
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                prefix={<SearchOutlined />}
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
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
                Thêm mới sản phẩm
              </Button>
            </div>
          </div>

          <Table<ShopItem>
            columns={itemColumns}
            dataSource={filteredItems}
            rowKey="id"
            loading={isLoadingItems}
            pagination={{
              pageSize: 12,
              showSizeChanger: true,
              pageSizeOptions: ["10", "12", "20", "50"],
              showTotal: (total) => `Tổng cộng ${total} sản phẩm`,
            }}
            scroll={{ x: 950, y: "calc(100vh - 290px)" }}
            style={{ width: "100%" }}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. VIEW ĐƠN HÀNG NGƯỜI DÙNG (TABLE ANTD FULL MÀN HÌNH)    */}
      {/* ======================================================== */}
      {subTab === "orders" && (
        <div className="admin-table-container">
          <div className="admin-table-container__header">
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <h3 className="admin-table-container__title">Đơn hàng mua sắm ({orders.length})</h3>
              <Select
                value={orderStatusFilter}
                onChange={setOrderStatusFilter}
                style={{ width: 170 }}
                options={[
                  { value: "ALL", label: "-- Tất cả trạng thái --" },
                  { value: "PENDING", label: "Chờ xử lý" },
                  { value: "PROCESSING", label: "Đang xử lý" },
                  { value: "COMPLETED", label: "Đã hoàn thành" },
                  { value: "CANCELLED", label: "Đã hủy" },
                ]}
              />
              <Input
                placeholder="Tìm kiếm người mua..."
                prefix={<SearchOutlined />}
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                onPressEnter={loadOrders}
                style={{ width: 200 }}
                allowClear
              />
            </div>

            <div className="admin-table-container__actions">
              <Button icon={<ReloadOutlined />} onClick={loadOrders} loading={isLoadingOrders}>
                Làm mới
              </Button>
            </div>
          </div>

          <Table<ShopOrder>
            columns={orderColumns}
            dataSource={orders}
            rowKey="id"
            loading={isLoadingOrders}
            pagination={{
              pageSize: 12,
              showSizeChanger: true,
              pageSizeOptions: ["10", "12", "20", "50"],
              showTotal: (total) => `Tổng cộng ${total} đơn hàng`,
            }}
            scroll={{ x: 1050, y: "calc(100vh - 290px)" }}
            style={{ width: "100%" }}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL ANTD: THÊM MỚI / CHỈNH SỬA SẢN PHẨM                */}
      {/* ======================================================== */}
      <Modal
        title={editingItem ? `Chỉnh sửa sản phẩm: ${editingItem.name}` : "Thêm mới sản phẩm vào cửa hàng"}
        open={isItemModalOpen}
        onOk={handleModalSubmit}
        onCancel={() => setIsItemModalOpen(false)}
        confirmLoading={isSubmittingItem}
        okText={editingItem ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        width={620}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
          >
            <Input placeholder="Ví dụ: Kính Tri thức STEAM" />
          </Form.Item>

          <Form.Item
            name="imageUrl"
            label="Đường dẫn ảnh sản phẩm (URL)"
            rules={[{ required: true, message: "Vui lòng nhập đường dẫn ảnh" }]}
          >
            <Input placeholder="/items/... hoặc https://..." />
          </Form.Item>

          {/* Gợi ý ảnh có sẵn */}
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6 }}>
              Ảnh mẫu hệ thống có sẵn (nhấp để chọn):
            </span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {SUGGESTED_IMAGES.map((img) => (
                <Tag
                  key={img.url}
                  color="blue"
                  style={{ cursor: "pointer", userSelect: "none" }}
                  onClick={() => form.setFieldValue("imageUrl", img.url)}
                >
                  {img.label}
                </Tag>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item
              name="coinPrice"
              label="Giá xu"
              rules={[{ required: true, message: "Vui lòng nhập giá xu" }]}
            >
              <InputNumber min={0} style={{ width: "100%" }} placeholder="10" />
            </Form.Item>

            <Form.Item
              name="stock"
              label="Số lượng tồn kho"
              extra="Bỏ trống nếu số lượng là vô hạn"
            >
              <InputNumber min={0} style={{ width: "100%" }} placeholder="Vô hạn" />
            </Form.Item>
          </div>

          <Form.Item
            name="isSpecial"
            label="Đánh dấu vật phẩm ĐẶC BIỆT"
            valuePropName="checked"
            extra="Vật phẩm đặc biệt yêu cầu người mua cung cấp thông tin liên lạc và gửi thông báo lên Admin để xử lý."
          >
            <Switch checkedChildren="⭐ ĐẶC BIỆT" unCheckedChildren="Thường" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả sản phẩm">
            <Input.TextArea rows={3} placeholder="Mô tả tính năng, quà tặng hoặc hướng dẫn nhận..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
