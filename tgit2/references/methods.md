# tgit2 方法说明

这个 skill 的方法不是手写的，而是从当前项目的 `openapi/api` 源码自动抽出来的。

## 命名规则

- 方法路径通常是 `serviceBrand.methodName`
- `serviceBrand` 取自当前项目里各个 OpenAPI 类的 `static serviceBrand`
- `methodName` 取自类里的 `public` 方法名

例如：

- `projects.get`
- `projects.members.getProjectMembers`
- `repository.git.files.getFile`
- `users.identity.getCurrentUser`

## 参数规则

- `method.path` 用点号分隔
- 请求路径里的 `{id_or_path}`、`{user_id}`、`{sha}` 之类占位符，从 JSON 参数中同名字段或常见别名里取值
- `GET` / `DELETE` 的剩余字段会作为 query 参数
- `POST` / `PUT` 的剩余字段会作为 body

## 完整列表

完整方法以 `node scripts/tgit.js --list` 为准。当前版本的方法集由 `openapi/api` 目录自动生成，覆盖本项目暴露的工蜂 REST API。

## 使用建议

- 不确定方法名时先跑 `node scripts/tgit.js --list`
- 不确定参数时，先看项目里的 OpenAPI 源码对应类和方法名
- 如果同一资源有多个版本或重名方法，直接用 `--list` 输出的完整路径

