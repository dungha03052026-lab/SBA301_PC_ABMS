import json

with open('.ua/knowledge-graph.json', 'r', encoding='utf-8') as f:
    old = json.load(f)

with open('.ua/intermediate/assembled-graph.json', 'r', encoding='utf-8') as f:
    assembled = json.load(f)

nodes = assembled['nodes']
node_ids = set(n['id'] for n in nodes)

frontend_ids = []
ctrl_ids = []
svc_ids = []
repo_ids = []
model_ids = []

for n in nodes:
    nid = n['id']
    fpath = n.get('filePath', '')
    if 'fe/' in fpath:
        frontend_ids.append(nid)
    elif 'controller' in fpath:
        ctrl_ids.append(nid)
    elif 'service' in fpath:
        svc_ids.append(nid)
    elif 'repository' in fpath or 'specification' in fpath:
        repo_ids.append(nid)
    elif any(k in fpath for k in ['model', 'dto', 'entity', 'config', 'security', 'exception']):
        model_ids.append(nid)
    else:
        frontend_ids.append(nid)

layers = [
    {
        'id': 'layer:frontend',
        'name': 'Frontend Presentation (React & AntD)',
        'description': 'Giao diện người dùng React 19, Vite, Ant Design, PlayStation Design System',
        'nodeIds': frontend_ids
    },
    {
        'id': 'layer:backend-controllers',
        'name': 'Backend REST API Controllers',
        'description': 'Các REST Controller Spring Boot tiếp nhận request và phân quyền',
        'nodeIds': ctrl_ids
    },
    {
        'id': 'layer:backend-services',
        'name': 'Backend Business Services',
        'description': 'Xử lý logic nghiệp vụ quản lý căn hộ, điện nước, sự cố kỹ thuật',
        'nodeIds': svc_ids
    },
    {
        'id': 'layer:backend-repositories',
        'name': 'Data Access & Specifications',
        'description': 'Spring Data JPA Repositories và JPA Criteria Specifications',
        'nodeIds': repo_ids
    },
    {
        'id': 'layer:backend-models',
        'name': 'Domain Entities & DTOs',
        'description': 'Mô hình dữ liệu MSSQL và các DTO Request / Response',
        'nodeIds': model_ids
    }
]

tour = [
    {
        'order': 1,
        'title': 'Tổng quan Dự án & Đặc tả Nghiệp vụ',
        'description': 'Tài liệu kiến trúc toàn diện, SRS và hướng dẫn kỹ thuật',
        'nodeIds': [nid for nid in ['document:ABMS_ProjectGuidelines.md', 'document:HUONG_DAN_THUYET_TRINH_SPECIFICATION.md', 'document:docs/UA_ONBOARDING.md'] if nid in node_ids]
    },
    {
        'order': 2,
        'title': 'Entry Point & Bảo mật Spring Boot',
        'description': 'Điểm khởi động hệ thống và cấu hình Security JWT',
        'nodeIds': [nid for nid in ['file:be/ApartmentBS/src/main/java/com/example/apartmentbs/ApartmentBsApplication.java', 'file:be/ApartmentBS/src/main/java/com/example/apartmentbs/config/SecurityConfig.java'] if nid in node_ids]
    },
    {
        'order': 3,
        'title': 'JPA Criteria API Specification',
        'description': 'Trọng tâm kỹ thuật lọc động an toàn chống SQL Injection',
        'nodeIds': [nid for nid in ['document:HUONG_DAN_THUYET_TRINH_SPECIFICATION.md', 'file:be/ApartmentBS/src/main/java/com/example/apartmentbs/repository/specification/ApartmentSpecification.java'] if nid in node_ids]
    },
    {
        'order': 4,
        'title': 'Giao diện Quản trị Căn hộ & Cư dân',
        'description': 'Module Admin kết nối Criteria API và tuân thủ PlayStation Design System',
        'nodeIds': [nid for nid in ['file:fe/src/modules/admin/ApartmentManagement.jsx', 'file:fe/src/modules/technician/TaskPool.jsx'] if nid in node_ids]
    }
]

full_graph = {
    'version': '1.0.0',
    'project': {
        'name': 'SBA301_PC_ABMS',
        'languages': ['Java', 'JavaScript', 'JSX', 'CSS', 'Markdown'],
        'frameworks': ['Spring Boot 3.3', 'Spring Data JPA', 'Spring Security JWT', 'React 19', 'Ant Design 5', 'Vite'],
        'description': 'Hệ thống Quản lý Chung cư Cao cấp SBA301 (Apartment Building Management System)',
        'analyzedAt': '2026-11-03T14:50:00.000Z',
        'gitCommitHash': 'deaa17206b2e3020f91a8210bc425d8efc48db0b'
    },
    'nodes': nodes,
    'edges': assembled['edges'],
    'layers': layers,
    'tour': tour
}

with open('.ua/knowledge-graph.json', 'w', encoding='utf-8') as f:
    json.dump(full_graph, f, ensure_ascii=False, indent=2)

meta = {
    'analyzedAt': '2026-11-03T14:50:00.000Z',
    'gitCommitHash': 'deaa17206b2e3020f91a8210bc425d8efc48db0b',
    'nodeCount': len(nodes),
    'edgeCount': len(assembled['edges']),
    'layerCount': len(layers),
    'tourSteps': len(tour)
}

with open('.ua/meta.json', 'w', encoding='utf-8') as f:
    json.dump(meta, f, ensure_ascii=False, indent=2)

print('Updated knowledge-graph.json and meta.json successfully!')
print(f'Total nodes: {len(nodes)}, edges: {len(assembled["edges"])}, layers: {len(layers)}, tour: {len(tour)}')
