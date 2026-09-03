-- ====================================================================
-- 002_roles_permissions.sql
-- The Wisdom Academy School / Klapanya E-Learning
-- Roles & Permissions Schema and Seed Data
-- ====================================================================

-- 1. Create Roles Table
CREATE TABLE IF NOT EXISTS public.roles (
    id TEXT PRIMARY KEY, -- 'LEARNER', 'PROFESSOR', 'ADMIN', etc.
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Create Permissions Table
CREATE TABLE IF NOT EXISTS public.permissions (
    id TEXT PRIMARY KEY, -- 'VIEW_OWN_PROGRESS', 'CREATE_ARENA', etc.
    description TEXT NOT NULL
);

-- 3. Create Role Permissions Mapping Table
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id TEXT NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id TEXT NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 4. Seed Canonical Roles
INSERT INTO public.roles (id, name, description) VALUES
('LEARNER', 'Learner (นักเรียน)', 'นักเรียนผู้กล้าแห่งสถาบันการเรียนรู้'),
('PROFESSOR', 'Professor (ครูผู้สอน)', 'อาจารย์และครูผู้ดูแลห้องเรียน'),
('ADMIN', 'Admin (ผู้ดูแลระบบ)', 'ผู้ดูแลระบบและเนื้อหาการศึกษาของโรงเรียน'),
('REVIEWER_DEV', 'Reviewer Dev (ผู้ตรวจประเมิน)', 'ผู้ตรวจสอบระบบและเนื้อหาในโหมดแซนด์บ็อกซ์'),
('EXTERNAL_LEARNER', 'External Learner (ผู้เรียนภายนอก)', 'ผู้เรียนทั่วไปภายนอกโรงเรียน'),
('EXTERNAL_PROFESSOR', 'External Professor (ครูภายนอก)', 'อาจารย์รับเชิญภายนอก')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 5. Seed Canonical Sprint 5 Permissions
INSERT INTO public.permissions (id, description) VALUES
('VIEW_OWN_PROGRESS', 'ดูโปรไฟล์และพัฒนาการการเรียนรู้ของตนเอง'),
('VIEW_CLASS_PROGRESS', 'ดูสถิติและคะแนนรวมของห้องเรียนที่รับผิดชอบ'),
('CREATE_ASSIGNMENT', 'สร้างและมอบหมายการบ้าน/ดริลล์แก่นักเรียน'),
('CREATE_ARENA', 'สร้างห้องประลองสดในชั้นเรียนด้วย Room Code'),
('JOIN_ARENA', 'เข้าร่วมการแข่งขันในห้องประลองสด'),
('UPLOAD_CONTENT', 'อัปโหลดและเสนอชุดคำถามใหม่เข้าสู่ระบบ'),
('PUBLISH_CONTENT', 'อนุมัติและเผยแพร่ข้อสอบสู่ระบบหลัก'),
('VIEW_REPORTS', 'ออกรายงานผลสัมฤทธิ์และวิเคราะห์ทักษะ DNA'),
('MANAGE_USERS', 'จัดการบัญชีและสิทธิ์ของผู้ใช้งาน'),
('ACCESS_REVIEW_HUB', 'เข้าถึงศูนย์ทดสอบและตรวจสอบระบบ (Review Hub)')
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description;

-- 6. Seed Role-Permission Matrix
-- LEARNER
INSERT INTO public.role_permissions (role_id, permission_id) VALUES
('LEARNER', 'VIEW_OWN_PROGRESS'),
('LEARNER', 'JOIN_ARENA'),
('EXTERNAL_LEARNER', 'VIEW_OWN_PROGRESS'),
('EXTERNAL_LEARNER', 'JOIN_ARENA'),

-- PROFESSOR
('PROFESSOR', 'VIEW_OWN_PROGRESS'),
('PROFESSOR', 'VIEW_CLASS_PROGRESS'),
('PROFESSOR', 'CREATE_ASSIGNMENT'),
('PROFESSOR', 'CREATE_ARENA'),
('PROFESSOR', 'JOIN_ARENA'),
('PROFESSOR', 'UPLOAD_CONTENT'),
('PROFESSOR', 'VIEW_REPORTS'),

-- EXTERNAL PROFESSOR
('EXTERNAL_PROFESSOR', 'VIEW_OWN_PROGRESS'),
('EXTERNAL_PROFESSOR', 'VIEW_CLASS_PROGRESS'),
('EXTERNAL_PROFESSOR', 'CREATE_ARENA'),
('EXTERNAL_PROFESSOR', 'JOIN_ARENA'),
('EXTERNAL_PROFESSOR', 'VIEW_REPORTS'),

-- ADMIN
('ADMIN', 'VIEW_OWN_PROGRESS'),
('ADMIN', 'VIEW_CLASS_PROGRESS'),
('ADMIN', 'CREATE_ASSIGNMENT'),
('ADMIN', 'CREATE_ARENA'),
('ADMIN', 'JOIN_ARENA'),
('ADMIN', 'UPLOAD_CONTENT'),
('ADMIN', 'PUBLISH_CONTENT'),
('ADMIN', 'VIEW_REPORTS'),
('ADMIN', 'MANAGE_USERS'),
('ADMIN', 'ACCESS_REVIEW_HUB'),

-- REVIEWER DEV
('REVIEWER_DEV', 'VIEW_OWN_PROGRESS'),
('REVIEWER_DEV', 'JOIN_ARENA'),
('REVIEWER_DEV', 'ACCESS_REVIEW_HUB')
ON CONFLICT (role_id, permission_id) DO NOTHING;
