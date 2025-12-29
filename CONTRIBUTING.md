# CONTRIBUTING

팀 Git 컨벤션(요약)

- 브랜치: `dev`에서 개발 → PR → `main` 병합
- 커밋: `type(scope): subject` (예: `fix(video): 연결 끊김 해결`)

로컬 설정 (Node)
```bash
cd /home/ubuntu/workspace/BE
npm ci
cp .env.example .env && edit .env
```

Pre-commit
```bash
pip install pre-commit
pre-commit install
pre-commit run --all-files
```

PR 체크리스트
- [ ] `pre-commit` 통과
- [ ] 변경 및 테스트 방법 명시
