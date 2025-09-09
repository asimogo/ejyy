# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

「e家宜业」(ejyy) is an open-source smart property management system built with multi-platform support including WeChat Official Account, Mini Program, PC, H5, and IoT devices. The system is built under AGPL v3 license.

## 开发目标
本次开发主要为复刻老项目，让项目原有行为可正常工作。禁止增加新功能；非必要不升级技术栈，确实需要升级技术栈才能保证项目运行的情况，必须事先征得用户许可。

## Project Structure

The repository contains four main applications:

- **api-server/** - Backend API server (Koa + TypeScript)
- **console-web/** - Web management console (Vue.js + view-design)
- **owner-mp/** - Owner mini program (WeChat Mini Program)
- **property-mp/** - Property management mini program (WeChat Mini Program)
- **resources/** - Static resources and database schema

## Development Commands

### API Server (api-server/)
```bash
npm run dev          # Start development server with nodemon
npm run lint         # Format TypeScript files with prettier
npm run dist         # Build production bundle with webpack
```

### Web Console (console-web/)
```bash
npm run dev          # Start Vue.js development server (with legacy OpenSSL support)
npm run dist         # Build for production (includes iconfont compilation)
npm run lint         # Run ESLint with Vue support
npm run iconfont     # Compile custom fonts using cwfont
```

### Owner Mini Program (owner-mp/)
```bash
npm run lint         # Format JavaScript files with prettier
```

### Property Mini Program (property-mp/)
```bash
npm run lint         # Format JavaScript files with prettier
```

## Configuration

The API server requires a `.ejyyrc` YAML configuration file in the project root containing:
- MySQL database settings
- Redis configuration  
- WeChat app configurations (Mini Program, Official Account, Payment)
- Aliyun OSS settings
- SMTP settings
- Map API keys

## Architecture

### Backend (api-server)
- **Framework**: Koa.js with TypeScript
- **Database**: MySQL with Knex.js ORM
- **Session Storage**: Redis with custom MySQL session store
- **WebSocket**: Real-time notifications via ws library
- **Modules**: Organized into `/mp` (mobile), `/pc` (web), `/oa` (official account), `/notify` (webhooks)
- **Middleware**: Model injection, IP tracking, header processing, request watching
- **Services**: Access control, payment, SMS, file upload, WeChat integration
- **Scheduled Jobs**: Background tasks for maintenance and data processing

### Frontend (console-web)
- **Framework**: Vue.js 2 with view-design UI library
- **State Management**: Vuex
- **Routing**: Vue Router
- **Build Tool**: Vue CLI with custom webpack configuration
- **Features**: Rich text editor, charts (ECharts), drag-and-drop, image processing
- **Theming**: Custom LESS styles with multiple theme support

### Mini Programs
Both mini programs use WeChat's native framework with:
- **Components**: Custom component library (similar to Vant)
- **Utils**: Request handling, file processing, storage management
- **Pages**: Feature-specific page modules
- **Configuration**: Host settings in `config.js` files

### Database Schema
Located in `resources/db.sql` - includes tables for:
- User management and authentication
- Community and building management
- Service requests (repairs, complaints, etc.)
- Payment and billing
- IoT device integration
- Workflow and approval processes

## Key Features by Module

### Core Services
- **User Management**: Multi-role authentication (owners, property staff, admin)
- **Community Management**: Building/unit hierarchy, family member management
- **Service Requests**: Repairs, complaints, fitment applications
- **Payment System**: WeChat Pay integration with billing management
- **IoT Integration**: Elevator, entrance, parking, energy monitoring
- **Workflow Engine**: Approval processes for various operations

### Technical Integration Points
- **WeChat Ecosystem**: Mini programs, Official Account, Payment API
- **Third-party Services**: Aliyun OSS for file storage, SMS services
- **Real-time Features**: WebSocket for live updates and notifications
- **Data Export**: Excel generation for reports and templates

## Development Notes

- The system uses module aliases (`~` points to `src/` in api-server)
- Database BLOB fields named 'content' are automatically parsed as JSON
- WeChat integration requires proper app credentials and certificates
- The web console includes a comprehensive print system for various document types
- Multi-tenant architecture supports multiple communities per installation