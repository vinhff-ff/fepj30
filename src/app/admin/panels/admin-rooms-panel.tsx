"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { createRoom, deleteRoom, getRooms, updateRoom } from "@/modules/lessons";
import type { Room, RoomPayload } from "@/modules/lessons";

export function AdminRoomsPanel() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal thêm / sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();

  async function loadRooms() {
    setIsLoading(true);
    try {
      setRooms(await getRooms());
    } catch {
      message.error("Không thể tải danh sách cấp độ phòng học.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadRooms();
  }, []);

  const handleOpenCreateModal = () => {
    if (rooms.length >= 4) {
      message.warning("Hệ thống chỉ hỗ trợ tối đa 4 cấp độ (từ Lớp 6 đến Lớp 9).");
      return;
    }
    setEditingRoom(null);
    form.resetFields();
    form.setFieldsValue({
      name: `Lớp ${6 + rooms.length}`,
      order: rooms.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (room: Room) => {
    setEditingRoom(room);
    form.resetFields();
    form.setFieldsValue({
      name: room.name,
      order: room.order,
    });
    setIsModalOpen(true);
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);

      const payload: RoomPayload = {
        name: values.name.trim(),
        order: Number(values.order),
      };

      if (editingRoom) {
        const updated = await updateRoom(editingRoom.id, payload);
        setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        message.success(`Đã cập nhật "${updated.name}" thành công!`);
      } else {
        const created = await createRoom(payload);
        setRooms((prev) => [...prev, created]);
        message.success(`Đã tạo "${created.name}" thành công!`);
      }

      setIsModalOpen(false);
      form.resetFields();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errorFields" in err) {
        return;
      }
      message.error("Có lỗi xảy ra khi lưu phòng học.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoom = async (room: Room) => {
    try {
      await deleteRoom(room.id);
      setRooms((prev) => prev.filter((r) => r.id !== room.id));
      message.success(`Đã xóa phòng "${room.name}".`);
    } catch {
      message.error("Không thể xóa phòng học này.");
    }
  };

  const columns: ColumnsType<Room> = [
    {
      title: "Tên cấp độ / Phòng học",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <span style={{ fontWeight: 700, fontSize: 15 }}>{name}</span>,
    },
    {
      title: "Thứ tự hiển thị",
      dataIndex: "order",
      key: "order",
      width: 150,
      render: (order: number) => <Tag color="blue">Thứ tự: {order}</Tag>,
    },
    {
      title: "Số bài học",
      dataIndex: ["_count", "lessons"],
      key: "lessonsCount",
      width: 150,
      render: (_, record) => (
        <span style={{ fontWeight: 600 }}>{record._count?.lessons || 0} bài học</span>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
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
            title="Xác nhận xóa cấp độ"
            description={`Bạn có chắc muốn xóa "${record.name}"? Tất cả bài học thuộc phòng này sẽ bị xóa theo.`}
            onConfirm={() => handleDeleteRoom(record)}
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
        <div>
          <h3 className="admin-table-container__title">
            Quản lý cấp độ bài học ({rooms.length}/4)
          </h3>
        </div>

        <div className="admin-table-container__actions">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreateModal}
            disabled={rooms.length >= 4}
            size="middle"
          >
            Thêm mới cấp độ
          </Button>
        </div>
      </div>

      <Table<Room>
        columns={columns}
        dataSource={rooms}
        rowKey="id"
        loading={isLoading}
        pagination={false}
        scroll={{ x: 600 }}
        style={{ width: "100%" }}
      />

      <Modal
        title={editingRoom ? `Chỉnh sửa: ${editingRoom.name}` : "Thêm mới cấp độ phòng học"}
        open={isModalOpen}
        onOk={handleModalSubmit}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={isSubmitting}
        okText={editingRoom ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        width={480}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Tên phòng (Lớp)"
            rules={[{ required: true, message: "Vui lòng nhập tên phòng" }]}
          >
            <Input placeholder="Ví dụ: Lớp 6" />
          </Form.Item>

          <Form.Item
            name="order"
            label="Thứ tự hiển thị"
            rules={[{ required: true, message: "Vui lòng nhập số thứ tự" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
