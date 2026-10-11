"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  createLesson,
  deleteLesson,
  getLesson,
  getLessons,
  getRooms,
  updateLesson,
} from "@/modules/lessons";
import type { Lesson, LessonPayload, Room } from "@/modules/lessons";

export function AdminLessonsPanel() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomId, setRoomId] = useState<string>("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);

  // Modal thêm / sửa bài học
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    async function loadRooms() {
      try {
        const data = await getRooms();
        setRooms(data);
        if (data.length > 0 && !roomId) {
          setRoomId(data[0].id);
        }
      } catch {
        message.error("Không thể tải danh sách cấp độ phòng học.");
      } finally {
        setIsLoadingRooms(false);
      }
    }

    void loadRooms();
  }, []);

  useEffect(() => {
    if (!roomId) {
      setLessons([]);
      return;
    }

    async function loadLessons() {
      setIsLoadingLessons(true);
      try {
        setLessons(await getLessons(roomId));
      } catch {
        message.error("Không thể tải danh sách bài học của cấp độ này.");
      } finally {
        setIsLoadingLessons(false);
      }
    }

    void loadLessons();
  }, [roomId]);

  const handleOpenCreateModal = () => {
    if (!roomId) {
      message.warning("Vui lòng chọn cấp độ phòng học trước khi thêm bài học.");
      return;
    }
    setEditingLesson(null);
    form.resetFields();
    form.setFieldsValue({
      name: `Bài học ${lessons.length + 1}`,
      order: lessons.length + 1,
      html: "<!doctype html>\n<html>\n<head>\n  <meta charset=\"utf-8\">\n  <title>Bài học</title>\n</head>\n<body>\n  <h1>Nội dung bài học mới</h1>\n</body>\n</html>",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = async (lesson: Lesson) => {
    setEditingLesson(lesson);
    form.resetFields();
    try {
      const detail = await getLesson(lesson.id);
      form.setFieldsValue({
        name: lesson.name,
        order: lesson.order,
        html: detail.html || "",
      });
      setIsModalOpen(true);
    } catch {
      message.error("Không tải được chi tiết bài học.");
    }
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);

      const payload: LessonPayload = {
        name: values.name.trim(),
        order: Number(values.order),
        html: values.html,
      };

      if (editingLesson) {
        await updateLesson(editingLesson.id, payload);
        setLessons((prev) =>
          prev.map((l) => (l.id === editingLesson.id ? { ...l, ...payload } : l))
        );
        message.success(`Đã cập nhật bài học "${payload.name}" thành công!`);
      } else {
        const created = await createLesson(roomId, payload);
        setLessons((prev) => [...prev, created]);
        message.success(`Đã tạo bài học "${created.name}" thành công!`);
      }

      setIsModalOpen(false);
      form.resetFields();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errorFields" in err) {
        return;
      }
      message.error("Có lỗi xảy ra khi lưu bài học.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lesson: Lesson) => {
    try {
      await deleteLesson(lesson.id);
      setLessons((prev) => prev.filter((l) => l.id !== lesson.id));
      message.success(`Đã xóa bài học "${lesson.name}".`);
    } catch {
      message.error("Xóa bài học thất bại.");
    }
  };

  const columns: ColumnsType<Lesson> = [
    {
      title: "Tên bài học",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <span style={{ fontWeight: 700, fontSize: 15 }}>{name}</span>,
    },
    {
      title: "Thứ tự",
      dataIndex: "order",
      key: "order",
      width: 140,
      render: (order: number) => <Tag color="blue">Bài số {order}</Tag>,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 220,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            href={`/lessons/${roomId}/${record.id}`}
            target="_blank"
          >
            Xem
          </Button>
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
            title="Xác nhận xóa bài học"
            description={`Bạn có chắc muốn xóa bài học "${record.name}"?`}
            onConfirm={() => handleDeleteLesson(record)}
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
          <h3 className="admin-table-container__title">Quản lý bài học</h3>
          <Select
            value={roomId}
            onChange={(val) => setRoomId(val)}
            style={{ width: 200 }}
            loading={isLoadingRooms}
            placeholder="Chọn cấp độ phòng học..."
            options={rooms.map((r) => ({
              value: r.id,
              label: `${r.name} (${r._count?.lessons || 0} bài)`,
            }))}
          />
        </div>

        <div className="admin-table-container__actions">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreateModal}
            disabled={!roomId}
            size="middle"
          >
            Thêm mới bài học
          </Button>
        </div>
      </div>

      <Table<Lesson>
        columns={columns}
        dataSource={lessons}
        rowKey="id"
        loading={isLoadingLessons}
        pagination={{
          pageSize: 12,
          showSizeChanger: true,
          showTotal: (total) => `Tổng cộng ${total} bài học`,
        }}
        scroll={{ x: 700, y: "calc(100vh - 290px)" }}
        style={{ width: "100%" }}
      />

      <Modal
        title={editingLesson ? `Chỉnh sửa: ${editingLesson.name}` : "Thêm mới bài học"}
        open={isModalOpen}
        onOk={handleModalSubmit}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={isSubmitting}
        okText={editingLesson ? "Cập nhật" : "Tạo bài học"}
        cancelText="Hủy"
        width={780}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 12 }}>
            <Form.Item
              name="name"
              label="Tên bài học"
              rules={[{ required: true, message: "Vui lòng nhập tên bài học" }]}
            >
              <Input placeholder="Ví dụ: Bài 1 - Chuyển động cơ học" />
            </Form.Item>

            <Form.Item
              name="order"
              label="Thứ tự bài học"
              rules={[{ required: true, message: "Vui lòng nhập thứ tự" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </div>

          <Form.Item
            name="html"
            label="Mã nguồn HTML nội dung bài học"
            rules={[{ required: true, message: "Vui lòng nhập nội dung HTML của bài học" }]}
          >
            <Input.TextArea
              rows={12}
              style={{ fontFamily: "monospace", fontSize: 13 }}
              placeholder="<!doctype html>..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
