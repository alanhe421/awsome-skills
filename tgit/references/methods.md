# tgit-api 方法速查表

完整方法清单，按资源类型分组。每个方法以 `tgit-api` 的命名为准（dot 形式即 `scripts/tgit.js` 的第一个参数）。

调用约定：
- `:xxx` 形式的占位符 → 必须以同名字段出现在 JSON 参数中（如 `:id` → `{"id": ...}`，`:merge_request_id` → `{"merge_request_id": ...}`）。
- `GET` 方法的其余字段会拼到 query string；`POST/PUT/DELETE` 的其余字段会作为请求 body。
- `:id` 通常表示项目 ID（数字）或带 URL 编码的 namespace 路径（如 `group%2Frepo`）。

---

## Namespaces / Groups（命名空间与项目组）

| 方法 | 说明 | 关键参数 |
|---|---|---|
| `namespaces` | 获取命名空间列表 | `search`, `page`, `per_page` |
| `groups` | 获取项目组列表 | `search`, `page`, `per_page` |
| `groups.add` | 新建项目组 | `name`, `path`, `description` |
| `groups.get` | 项目组详情 | `id` |
| `groups.delete` | 删除项目组 | `id` |
| `groups.members` | 项目组成员列表 | `id` |
| `groups.members.add` | 增加成员 | `id`, `user_id`, `access_level` |
| `groups.members.modify` | 修改成员 | `id`, `user_id`, `access_level` |
| `groups.members.delete` | 移除成员 | `id`, `user_id` |

## Users（用户）

| 方法 | 说明 | 关键参数 |
|---|---|---|
| `user` | 当前认证用户 | — |
| `self` | 当前认证用户（别名） | — |
| `users` | 用户列表 | `search`, `username` |
| `users.add` | 新增用户 | `email`, `password`, `username`, `name` |
| `users.get` | 获取指定用户 | `id` |
| `users.fromEmail` | 通过邮箱获取 | `email` |
| `users.modify` | 修改用户 | `id`, ... |
| `users.delete` | 删除用户 | `id` |
| `users.keys` | 用户 SSH key 列表 | `uid` |
| `users.keys.add` | 添加 SSH key | `id`, `title`, `key` |
| `users.keys.delete` | 删除 SSH key | `uid`, `id` |
| `users.emails` | 用户邮箱列表 | `uid` |
| `users.emails.add` | 添加邮箱 | `id`, `email` |
| `users.emails.delete` | 删除邮箱 | `uid`, `id` |
| `users.block` | 锁定用户 | `uid` |
| `users.unblock` | 解锁用户 | `uid` |
| `users.identity` | 创建认证方式 | `uid`, `provider`, `extern_uid` |

## 当前用户相关

| 方法 | 说明 | 关键参数 |
|---|---|---|
| `owned` | 当前用户拥有的项目 | `page`, `per_page` |
| `watched` | 当前用户关注的项目 | — |
| `keys` | 当前用户 SSH key 列表 | — |
| `keys.add` | 添加 SSH key | `title`, `key` |
| `keys.get` | 查询 SSH key | `id` |
| `keys.delete` | 删除 SSH key | `id` |
| `emails` | 当前用户邮箱列表 | — |
| `email.add` | 添加邮箱 | `email` |
| `emails.get` | 邮箱详情 | `id` |
| `emails.delete` | 删除邮箱 | `id` |
| `issues` | 当前用户创建的缺陷列表 | `state`, `labels` |

## Projects（项目）

| 方法 | 说明 | 关键参数 |
|---|---|---|
| `projects` | 项目列表 | `search`, `page`, `per_page`, `order_by`, `sort` |
| `projects.owned` | 用户拥有的项目 | — |
| `projects.public` | 所有公有项目 | — |
| `projects.innerSource` | 内源项目列表 | — |
| `projects.add` | 创建项目 | `name`, `path`, `namespace_id`, `visibility_level` |
| `projects.addTo` | 为指定用户创建项目 | `user_id`, `name`, ... |
| `projects.get` | 项目详情 | `id` |
| `projects.modify` | 编辑项目 | `id`, ... |
| `projects.delete` | 删除项目 | `id` |
| `projects.fork` | Fork 项目 | `id` |
| `projects.forkFrom` | Fork 到命名空间 | `id`, `forked_from_id` |
| `projects.fork.delete` | 删除 Fork 关系 | `id` |
| `projects.archive` | 下载存档版本库 | `id`, `sha` |
| `projects.archive.add` | 归档项目 | `id` |
| `projects.archive.delete` | 取消归档 | `id` |
| `projects.contributors` | 贡献者列表 | `id` |
| `projects.events` | 项目事件列表 | `id` |
| `projects.watchers` | 关注者列表 | `id` |
| `projects.watch` / `projects.unwatch` / `projects.isWatch` | 关注操作 | `id` |
| `projects.stars` / `projects.star` / `projects.unstar` / `projects.isStar` | 标星操作 | `id` |
| `projects.shares` | share group 列表 | `id` |

## 仓库内容（文件 / Blob / 比较）

| 方法 | 说明 | 关键参数 |
|---|---|---|
| `projects.files` | 目录列表 | `id`, `path`, `ref_name` |
| `projects.files.get` | 获取文件 | `id`, `file_path`, `ref` |
| `projects.files.add` | 新增文件 | `id`, `file_path`, `branch_name`, `content`, `commit_message` |
| `projects.files.modify` | 编辑文件 | `id`, `file_path`, `branch_name`, `content`, `commit_message` |
| `projects.files.delete` | 删除文件 | `id`, `file_path`, `branch_name`, `commit_message` |
| `projects.files.history` | 文件提交历史 (blame) | `id`, `file_path`, `ref` |
| `projects.raw` | blob 原始内容（按 sha） | `id`, `sha`, `filepath` |
| `projects.blob` | raw_blob | `id`, `sha` |
| `projects.compare` | 差异 | `id`, `from`, `to` |
| `projects.compare.commits` | 差异 commits | `id`, `from`, `to` |
| `projects.compare.changed_files` | 下载差异文件集 | `id`, `from`, `to` |
| `projects.compare.changed_files.list` | 差异文件列表 | `id`, `from`, `to` |

## Branches（分支）

| 方法 | 说明 | 关键参数 |
|---|---|---|
| `projects.branches` | 分支列表 | `id` |
| `projects.branches.add` | 创建分支 | `id`, `branch_name`, `ref` |
| `projects.branches.get` | 分支详情 | `id`, `branch` |
| `projects.branches.edit` | 编辑分支 | `id`, `branch` |
| `projects.branches.delete` | 删除分支 | `id`, `branch` |
| `projects.branches.protect` | 设为保护分支 | `id`, `branch` |
| `projects.branches.protected_branch_rules` | 设为保护分支（指定规则组） | `id`, `rule_id`, `branch` |
| `projects.branches.unprotect` | 取消保护 | `id`, `branch` |
| `projects.branches.lifecycle` | 分支生命周期 | `id` |
| `projects.branches.settings` | 分支设置 | `id` |
| `projects.branches.merge_base` | 两分支 base commit | `id`, `from`, `to` |
| `projects.protected.get` | 保护分支详情 | `id`, `protected_branch_name` |
| `projects.protected.members` | 保护分支成员 | `id`, `protected_branch_name` |
| `projects.protected.members.add` | 添加成员 | `id`, `branch_name`, `user_id`, `access_level` |
| `projects.protected.members.modify` | 编辑成员 | `id`, `protected_branch_name`, `user_id` |
| `projects.protected.members.delete` | 删除成员 | `id`, `protected_branch_name`, `user_id` |

## Tags / Releases

| 方法 | 说明 | 关键参数 |
|---|---|---|
| `projects.tags` | TAG 列表 | `id` |
| `projects.tags.add` | 创建 TAG | `id`, `tag_name`, `ref`, `message` |
| `projects.tags.get` | TAG 详情 | `id`, `tag` |
| `projects.tags.delete` | 删除 TAG | `id`, `tag` |
| `projects.releases` | release 列表 | `id` |
| `projects.releases.get` | release 详情 | `id`, `tag_name` |
| `projects.releases.add` | 新增 release | `id`, `tag_name`, `description` |
| `projects.releases.modify` | 更新 release | `id`, `tag_name` |
| `projects.releases.delete` | 删除 release | `id`, `tag_name` |
| `projects.releases.attachments.add` | 上传附件 | `id`, `tag_name` |
| `projects.releases.attachments.get` | 下载附件 | `id`, `tag_name`, `attachment_name` |
| `projects.releases.attachments.delete` | 删除附件 | `id`, `tag_name`, `attachment_name` |

## Commits

| 方法 | 说明 | 关键参数 |
|---|---|---|
| `projects.commits` | commit 列表 | `id`, `ref_name`, `since`, `until` |
| `projects.commits.get` | 单个 commit | `id`, `sha` |
| `projects.commits.diff` | commit 差异 | `id`, `sha` |
| `projects.commits.refs` | commit 对应分支/tag | `id`, `sha` |
| `projects.commits.comments` | commit 评论列表 | `id`, `sha` |
| `projects.commits.comments.add` | 评论 commit | `id`, `sha`, `note` |
| `projects.commits.statuses` | 新增检测结果 | `id`, `sha`, `state`, `context`, `target_url` |
| `projects.commits.status` | 通过 ref 查询组合检测结果 | `id`, `ref` |

## Issues（缺陷）

| 方法 | 说明 | 关键参数 |
|---|---|---|
| `projects.issues` | 项目缺陷列表 | `id`, `state`, `labels` |
| `projects.issues.add` | 新建缺陷 | `id`, `title`, `description`, `assignee_id`, `labels` |
| `projects.issues.get` | 缺陷详情 | `id`, `issue_id` |
| `projects.issues.modify` | 修改缺陷 | `id`, `issue_id`, `title`, `state_event` |
| `projects.issues.subscribe` | 订阅 | `id`, `issue_id` |
| `projects.issues.unsubscribe` | 取消订阅 | `id`, `issue_id` |
| `projects.issues.isSubscribe` | 是否已订阅 | `id`, `issue_id` |
| `projects.issues.notes` | 评论列表 | `id`, `issue_id` |
| `projects.issues.notes.add` | 新增评论 | `id`, `issue_id`, `body` |
| `projects.issues.notes.get` | 单条评论 | `id`, `issue_id`, `note_id` |
| `projects.issues.notes.modify` | 修改评论 | `id`, `issue_id`, `note_id`, `body` |

## Labels / Milestones

| 方法 | 说明 | 关键参数 |
|---|---|---|
| `projects.labels` | 标签列表 | `id` |
| `projects.labels.add` | 新增标签 | `id`, `name`, `color` |
| `projects.labels.modify` | 修改标签 | `id`, `name`, `new_name`, `color` |
| `projects.labels.delete` | 删除标签 | `id`, `name` |
| `projects.milestones` | 里程碑列表 | `id` |
| `projects.milestones.add` | 新增里程碑 | `id`, `title`, `description`, `due_date` |
| `projects.milestones.get` | 里程碑详情 | `id`, `milestone_id` |
| `projects.milestones.modify` | 编辑里程碑 | `id`, `milestone_id` |
| `projects.milestones.delete` | 删除里程碑 | `id`, `milestone_id` |
| `projects.milestones.issues` | 里程碑下缺陷 | `id`, `milestone_id` |

## Merge Requests（合并请求）

| 方法 | 说明 | 关键参数 |
|---|---|---|
| `projects.merge_requests` | MR 列表 | `id`, `state`, `order_by`, `sort` |
| `projects.merge_requests.add` | 新增 MR | `id`, `source_branch`, `target_branch`, `title`, `assignee_id` |
| `projects.merge_requests.get` | MR 详情（按 id） | `id`, `merge_request_id` |
| `projects.merge_requests.getByIid` | MR 详情（按 iid） | `id`, `merge_request_iid` |
| `projects.merge_requests.check` | 刷新状态 | `id`, `merge_request_id` |
| `projects.merge_requests.changes` | 变更详情 | `id`, `merge_request_id` |
| `projects.merge_requests.merge` | 合并 | `id`, `merge_request_id`, `merge_commit_message` |
| `projects.merge_requests.modify` | 更新 MR | `id`, `merge_request_id`, `title`, `state_event` |
| `projects.merge_requests.merge_conflict_check` | 冲突检查 | `id`, `merge_request_id` |
| `projects.merge_requests.subscribe` | 订阅 | `id`, `merge_request_id` |
| `projects.merge_requests.unsubscribe` | 取消订阅 | `id`, `merge_request_id` |
| `projects.merge_requests.isSubscribe` | 是否订阅 | `id`, `merge_request_id` |
| `projects.merge_requests.comments` | 评论列表（旧） | `id`, `merge_request_id` |
| `projects.merge_requests.comments.add` | 新增评论（旧） | `id`, `merge_request_id`, `note` |
| `projects.merge_requests.comments.edit` | 编辑评论 | `id`, `merge_request_id`, `note_id`, `body` |
| `projects.merge_requests.commits` | MR commit 列表 | `id`, `merge_request_id` |
| `projects.merge_requests.notes` | 评论列表（新） | `id`, `merge_request_id` |
| `projects.merge_requests.notes.add` | 新增评论（新） | `id`, `merge_request_id`, `body` |
| `projects.merge_requests.notes.get` | 单条评论 | `id`, `merge_request_id`, `note_id` |
| `projects.merge_requests.notes.modify` | 编辑评论 | `id`, `merge_request_id`, `note_id`, `body` |
| `projects.merge_request.create_pre_merge_commit` | 生成预合并点 | `id`, `merge_request_iid` |
| `projects.merge_request.revert` | 回退 MR | `id`, `merge_request_id` |
| `projects.merge_requests.review` | 评审信息 | `id`, `merge_request_id` |
| `projects.merge_requests.review.invite` | 邀请评审人 | `id`, `merge_request_id`, `reviewer_ids` |
| `projects.merge_requests.review.dismissals` | 移除评审人 | `id`, `merge_request_id`, `user_id` |
| `projects.merge_requests.review.cancel` | 取消评审 | `id`, `merge_request_id` |
| `projects.merge_requests.review.summary` | 发表评审意见 | `id`, `merge_request_id`, `state`, `body` |
| `projects.merge_requests.review.reopen` | 重新打开评审 | `id`, `merge_request_id` |

## Project Members

| 方法 | 说明 | 关键参数 |
|---|---|---|
| `projects.members` | 成员列表 | `id` |
| `projects.members.all` | 全部有权限成员 | `id` |
| `projects.members.all.user` | 全部成员中某人 | `id`, `user_id` |
| `projects.members.add` | 新增成员 | `id`, `user_id`, `access_level` |
| `projects.members.get` | 成员详情 | `id`, `user_id` |
| `projects.members.modify` | 修改成员 | `id`, `user_id`, `access_level` |
| `projects.members.delete` | 删除成员 | `id`, `user_id` |

## Hooks（Webhooks）

| 方法 | 说明 | 关键参数 |
|---|---|---|
| `projects.hooks` | 回调钩子列表 | `id` |
| `projects.hooks.add` | 新增钩子 | `id`, `url`, `push_events`, `merge_requests_events` |
| `projects.hooks.get` | 钩子详情 | `id`, `hook_id` |
| `projects.hooks.modify` | 编辑钩子 | `id`, `hook_id` |
| `projects.hooks.delete` | 删除钩子 | `id`, `hook_id` |

## 代码评审（Commit Review）

| 方法 | 说明 | 关键参数 |
|---|---|---|
| `projects.reviews` | 项目所有 commit 评审 | `id` |
| `projects.reviews.notes` | 某 review 评论 | `id`, `review_id` |
| `projects.review` | 按 iid 查询 | `id`, `review_id` |
| `projects.review.add` | 新建 commit 评审 | `id`, `commit_id`, `reviewer_ids` |
| `projects.review.get` | 按 id 查询 | `id`, `review_id` |
| `projects.review.diff` | 评审 diff | `id`, `review_id` |
| `projects.review.invite` | 邀请评审人 | `id`, `review_id`, `reviewer_ids` |
| `projects.review.batch_invite` | 批量邀请 | `id`, `review_id` |
| `projects.review.dismissals` | 移除评审人 | `id`, `review_id`, `user_id` |

## 统计（tloc）

| 方法 | 说明 | 关键参数 |
|---|---|---|
| `projects.tloc.daily.count` | 按天提交次数/用户数 | `id`, `start_date`, `end_date` |
| `projects.tloc.daily.diff` | 按天代码行增量 | `id`, `start_date`, `end_date` |
| `projects.tloc.user.diff` | 各用户提交增量 | `id` |
| `projects.tloc.lang.diff` | 各语言提交增量 | `id` |
| `projects.tloc.commit.diff` | 指定 commit 增量 | `id`, `commit_id` |
| `projects.tloc.file.diff` | 文件提交情况 | `id`, `file_path` |
| `projects.tloc.commit.list` | commit 列表 | `id` |
| `projects.tloc.users.diff` | 指定用户提交增量 | `id`, `uid` |
| `projects.tloc.users.lang` | 指定用户各语言增量 | `id`, `uid` |

## TAPD 绑定

| 方法 | 说明 | 关键参数 |
|---|---|---|
| `projects.tapd_workitems` | 查看绑定的 TAPD 单 | `id` |
| `projects.tapd_workitems.add` | 创建并绑定 TAPD 单 | `id`, `workitem_id` |

---

> 实时获取本地实际可用方法：`node scripts/tgit.js --list`
