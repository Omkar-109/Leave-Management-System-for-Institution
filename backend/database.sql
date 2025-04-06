-- Create DATABASE
-- Database: LeaveManagementSystem

-- DROP DATABASE IF EXISTS "LeaveManagementSystem";

CREATE DATABASE "LeaveManagementSystem"
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_United States.1252'
    LC_CTYPE = 'English_United States.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

--Create Tables

-- Table: public.adminActions

-- DROP TABLE IF EXISTS public."adminActions";

CREATE TABLE IF NOT EXISTS public."adminActions"
(
    action_id character varying(10) COLLATE pg_catalog."default" NOT NULL,
    admin_id character varying(10) COLLATE pg_catalog."default" NOT NULL,
    action_type character varying(20) COLLATE pg_catalog."default" NOT NULL,
    action_details character varying(100) COLLATE pg_catalog."default",
    action_date date NOT NULL,
    CONSTRAINT "adminActions_pkey" PRIMARY KEY (action_id),
    CONSTRAINT admin_id FOREIGN KEY (action_id)
        REFERENCES public.admins (admin_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default; 

ALTER TABLE IF EXISTS public."adminActions"
    OWNER to postgres;

-- Table: public.admins

-- DROP TABLE IF EXISTS public.admins;

CREATE TABLE IF NOT EXISTS public.admins
(
    admin_id character varying(10) COLLATE pg_catalog."default" NOT NULL,
    name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    email character varying(50) COLLATE pg_catalog."default" NOT NULL,
    password character varying(100) COLLATE pg_catalog."default" NOT NULL,
    created_at date NOT NULL,
    CONSTRAINT admins_pkey PRIMARY KEY (admin_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.admins
    OWNER to postgres;


-- Table: public.credentials

-- DROP TABLE IF EXISTS public.credentials;

CREATE TABLE IF NOT EXISTS public.credentials
(
    credential_id character varying(10) COLLATE pg_catalog."default" NOT NULL,
    employee_id character varying(10) COLLATE pg_catalog."default" NOT NULL,
    email character varying(50) COLLATE pg_catalog."default" NOT NULL,
    password character varying(100) COLLATE pg_catalog."default" NOT NULL,
    created_at date NOT NULL,
    CONSTRAINT credentials_pkey PRIMARY KEY (credential_id),
    CONSTRAINT email UNIQUE (email),
    CONSTRAINT credentials_employee_id_fkey FOREIGN KEY (employee_id)
        REFERENCES public.employees (employees_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.credentials
    OWNER to postgres;

COMMENT ON COLUMN public.credentials.employee_id
    IS 'admin_id or employee_id depending of type of user';


-- Table: public.employeeAddresses

-- DROP TABLE IF EXISTS public."employeeAddresses";

CREATE TABLE IF NOT EXISTS public."employeeAddresses"
(
    address_id character varying(10) COLLATE pg_catalog."default" NOT NULL,
    employee_id character varying(10) COLLATE pg_catalog."default",
    leave_id character varying(10) COLLATE pg_catalog."default",
    address character varying(100) COLLATE pg_catalog."default" NOT NULL,
    created_at date NOT NULL,
    CONSTRAINT "employeeAddresses_pkey" PRIMARY KEY (address_id),
    CONSTRAINT employee_id FOREIGN KEY (employee_id)
        REFERENCES public.employees (employees_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT leave_id FOREIGN KEY (leave_id)
        REFERENCES public.leave (leave_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."employeeAddresses"
    OWNER to postgres;


-- Table: public.employee_phones

-- DROP TABLE IF EXISTS public.employee_phones;

CREATE TABLE IF NOT EXISTS public.employee_phones
(
    phone_id character varying(10) COLLATE pg_catalog."default" NOT NULL,
    employee_id character varying(10) COLLATE pg_catalog."default",
    leave_id character varying(10) COLLATE pg_catalog."default",
    phone character varying(20) COLLATE pg_catalog."default" NOT NULL,
    created_at date,
    CONSTRAINT employee_phones_pkey PRIMARY KEY (phone_id),
    CONSTRAINT employee_phones_employee_id_fkey FOREIGN KEY (employee_id)
        REFERENCES public.employees (employees_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT employee_phones_leave_id_fkey FOREIGN KEY (leave_id)
        REFERENCES public.leave (leave_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.employee_phones
    OWNER to postgres;


-- Table: public.employees

-- DROP TABLE IF EXISTS public.employees;

CREATE TABLE IF NOT EXISTS public.employees
(
    employees_id character varying(10) COLLATE pg_catalog."default" NOT NULL,
    name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    date_of_joining date NOT NULL,
    created_at date NOT NULL,
    CONSTRAINT employees_pkey PRIMARY KEY (employees_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.employees
    OWNER to postgres;


 -- Table: public.leave

-- DROP TABLE IF EXISTS public.leave;

CREATE TABLE IF NOT EXISTS public.leave
(
    leave_id character varying(10) COLLATE pg_catalog."default" NOT NULL,
    employee_id character varying(10) COLLATE pg_catalog."default" NOT NULL,
    start_date date NOT NULL,
    end_date date,
    leave_type character varying COLLATE pg_catalog."default" NOT NULL,
    status character varying(20) COLLATE pg_catalog."default" NOT NULL DEFAULT 'pending'::character varying,
    reason character varying(400) COLLATE pg_catalog."default" NOT NULL,
    program_director_status character varying(20) COLLATE pg_catalog."default" NOT NULL DEFAULT 'pending'::character varying,
    dean_status character varying(20) COLLATE pg_catalog."default" NOT NULL DEFAULT 'pending'::character varying,
    created_at date,
    updated_at date,
    CONSTRAINT leave_pkey PRIMARY KEY (leave_id),
    CONSTRAINT employee_id FOREIGN KEY (employee_id)
        REFERENCES public.employees (employees_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.leave
    OWNER to postgres;


-- Table: public.leaveApprovalWorkflow

-- DROP TABLE IF EXISTS public."leaveApprovalWorkflow";

CREATE TABLE IF NOT EXISTS public."leaveApprovalWorkflow"
(
    workflow_id character varying(10) COLLATE pg_catalog."default" NOT NULL,
    leave_id character varying(10) COLLATE pg_catalog."default" NOT NULL,
    approver_id character varying(10) COLLATE pg_catalog."default" NOT NULL,
    role character varying(20) COLLATE pg_catalog."default" NOT NULL,
    action character varying(20) COLLATE pg_catalog."default",
    reason character varying(200) COLLATE pg_catalog."default",
    note character varying(200) COLLATE pg_catalog."default",
    action_date character varying COLLATE pg_catalog."default",
    CONSTRAINT "leaveApprovalWorkflow_pkey" PRIMARY KEY (workflow_id),
    CONSTRAINT "leaveApprovalWorkflow_approver_id_fkey" FOREIGN KEY (approver_id)
        REFERENCES public.employees (employees_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT "leaveApprovalWorkflow_leave_id_fkey" FOREIGN KEY (leave_id)
        REFERENCES public.leave (leave_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."leaveApprovalWorkflow"
    OWNER to postgres;

COMMENT ON COLUMN public."leaveApprovalWorkflow".role
    IS 'dean or program director';


-- Table: public.leaveRecords

-- DROP TABLE IF EXISTS public."leaveRecords";

CREATE TABLE IF NOT EXISTS public."leaveRecords"
(
    record_id character varying(10) COLLATE pg_catalog."default" NOT NULL,
    employee_id character varying(10) COLLATE pg_catalog."default" NOT NULL,
    leave_type character varying(50) COLLATE pg_catalog."default",
    leaves_taken numeric(5,0),
    leaves_added numeric(5,0),
    balance_adjustment numeric(5,0),
    leaves_remaining numeric(5,0),
    updated_at date,
    CONSTRAINT "leaveRecords_pkey" PRIMARY KEY (record_id),
    CONSTRAINT "leaveRecords_employee_id_fkey" FOREIGN KEY (employee_id)
        REFERENCES public.employees (employees_id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."leaveRecords"
    OWNER to postgres;


-- Table: public.leaveTypes

-- DROP TABLE IF EXISTS public."leaveTypes";

CREATE TABLE IF NOT EXISTS public."leaveTypes"
(
    leave_type_id character varying(10) COLLATE pg_catalog."default" NOT NULL,
    faculty_type character varying(50) COLLATE pg_catalog."default" NOT NULL,
    leave_type character varying(50) COLLATE pg_catalog."default" NOT NULL,
    number_of_leaves numeric(5,0) NOT NULL,
    reset_frequency numeric(5,0),
    reset_date date,
    created_at date NOT NULL,
    CONSTRAINT "leaveTypes_pkey" PRIMARY KEY (leave_type_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."leaveTypes"
    OWNER to postgres;


-- Table: public.programs

-- DROP TABLE IF EXISTS public.programs;

CREATE TABLE IF NOT EXISTS public.programs
(
    program_id character varying(10) COLLATE pg_catalog."default" NOT NULL,
    program_name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    created_at date NOT NULL,
    CONSTRAINT programs_pkey PRIMARY KEY (program_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.programs
    OWNER to postgres;


-- Table: public.roleCredentials

-- DROP TABLE IF EXISTS public."roleCredentials";

CREATE TABLE IF NOT EXISTS public."roleCredentials"
(
    role_credentials_id character varying(10) COLLATE pg_catalog."default" NOT NULL,
    role_type character varying(20) COLLATE pg_catalog."default" NOT NULL,
    managed_entity_id character varying(10) COLLATE pg_catalog."default" NOT NULL,
    email character varying(50) COLLATE pg_catalog."default" NOT NULL,
    password character varying(50) COLLATE pg_catalog."default" NOT NULL,
    created_at date NOT NULL,
    CONSTRAINT "roleCredentials_pkey" PRIMARY KEY (role_credentials_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."roleCredentials"
    OWNER to postgres;

COMMENT ON COLUMN public."roleCredentials".role_type
    IS 'dean or program director';

COMMENT ON COLUMN public."roleCredentials".managed_entity_id
    IS 'the id of school or program from those tables';


-- Table: public.roles

-- DROP TABLE IF EXISTS public.roles;

CREATE TABLE IF NOT EXISTS public.roles
(
    role_id character varying(10) COLLATE pg_catalog."default" NOT NULL,
    employee_id character varying(10) COLLATE pg_catalog."default" NOT NULL,
    role_type character varying(50) COLLATE pg_catalog."default" NOT NULL,
    manages character varying(50) COLLATE pg_catalog."default" NOT NULL,
    managed_entity_id character varying(10) COLLATE pg_catalog."default" NOT NULL,
    created_at date NOT NULL,
    CONSTRAINT roles_pkey PRIMARY KEY (role_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.roles
    OWNER to postgres;


-- Table: public.schools

-- DROP TABLE IF EXISTS public.schools;

CREATE TABLE IF NOT EXISTS public.schools
(
    school_id character varying(10) COLLATE pg_catalog."default" NOT NULL,
    school_name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    created_at date NOT NULL,
    CONSTRAINT schools_pkey PRIMARY KEY (school_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.schools
    OWNER to postgres;   


-- work in for emp and program
CREATE TABLE employee_program (
    employees_id VARCHAR(10) NOT NULL,
    program_id VARCHAR(10) NOT NULL,
    created_at DATE DEFAULT CURRENT_DATE,
    
    PRIMARY KEY (employees_id, program_id),

    CONSTRAINT fk_employee
        FOREIGN KEY (employees_id)
        REFERENCES employees(employees_id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_program
        FOREIGN KEY (program_id)
        REFERENCES programs(program_id)
        ON DELETE CASCADE
);

--program_school relation
CREATE TABLE program_school (
    program_id VARCHAR(10) NOT NULL,
    school_id VARCHAR(10) NOT NULL,
    created_at DATE DEFAULT CURRENT_DATE,

    PRIMARY KEY (program_id, school_id),

    CONSTRAINT fk_program
        FOREIGN KEY (program_id)
        REFERENCES programs(program_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_school
        FOREIGN KEY (school_id)
        REFERENCES schools(school_id)
        ON DELETE CASCADE
);
