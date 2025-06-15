from fastapi import FastAPI, HTTPException, Depends
from sqlmodel import Session, select
from fastapi.middleware.cors import CORSMiddleware

from models import Template, TemplateFullIn, Node, Edge, NodeType, EdgeType
from db import create_db_and_tables, get_session

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    session = get_session()

    if not session.exec(select(NodeType)).first():
        session.add_all([
            NodeType(id=1, name="element"),
            NodeType(id=2, name="variable"),
            NodeType(id=3, name="array")
        ])

    if not session.exec(select(EdgeType)).first():
        session.add_all([
            EdgeType(id=1, name="single", label="Одиночная"),
            EdgeType(id=2, name="multi", label="Множественная")
        ])

    session.commit()

@app.get("/templates", response_model=list[Template])
def read_templates(session: Session = Depends(get_session)):
    return session.exec(select(Template)).all()

@app.get("/templates/{template_id}", response_model=Template)
def read_template(template_id: int, session: Session = Depends(get_session)):
    template = session.get(Template, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Шаблон не найден")
    return template

@app.post("/templates", response_model=Template)
def create_template(template: Template, session: Session = Depends(get_session)):
    session.add(template)
    session.commit()
    session.refresh(template)
    return template

@app.delete("/templates/{template_id}")
def delete_template(template_id: int, session: Session = Depends(get_session)):
    template = session.get(Template, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Шаблон не найден")
    session.delete(template)
    session.commit()
    return {"ok": True}

@app.post("/template/full")
def create_full_template(data: TemplateFullIn, session: Session = Depends(get_session)):
    template = Template(name=data.name)
    session.add(template)
    session.commit()
    session.refresh(template)

    node_objs = []
    for n in data.nodes:
        node = Node(
            type_id=n.type_id,
            label=n.label,
            custom_json=n.custom_json,
            is_root=n.is_root,
            template_id=template.id,
        )
        session.add(node)
        node_objs.append(node)

    session.commit()

    for e in data.edges:
        edge = Edge(
            template_id=template.id,
            prev_id=e.prev_id,
            next_id=e.next_id,
            type_id=e.type_id,
        )
        session.add(edge)

    session.commit()
    return {"id": template.id, "name": template.name}

@app.get("/template/{template_id}/full")
def get_full_template(template_id: int, session: Session = Depends(get_session)):
    template = session.get(Template, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Шаблон не найден")

    nodes = session.exec(select(Node).where(Node.template_id == template_id)).all()
    edges = session.exec(select(Edge).where(Edge.template_id == template_id)).all()

    return {
        "id": template.id,
        "name": template.name,
        "nodes": nodes,
        "edges": edges,
        "rootId": next((n.id for n in nodes if n.is_root), None)
    }
