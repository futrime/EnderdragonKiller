# Knowledge Base

李羿璇

主要作用：用作游戏内知识的查询

## 开发进度

2023.9.25 添加了无固定顺序合成表查询

2023.9.26 添加了固定顺序合成表查询

2023.9.26 修复了迭代 tag 的问题

2023.9.26 修复了 xx_from_xx 类型的多版本合成表的问题

2023.9.26 增加了熔炉合成表的查询

2023.9.26 增加了怪物掉落表的查询

## 使用方法

```python
import KnowledgeBase

kb = KnowledgeBase.KnowledgeBase()
print(kb.crafted_to_material["iron_ingot"])
"""
返回值：
[{'recipe': {'iron_block': 1}, 'type': 'player'}, {'recipe': {'iron_nugget': 9}, 'type': 'crafting_table'}
考虑了多种合成表存在的可能性，因此是一个列表。
"""
print(kb.material_to_crafted["diamond"])
"""
返回值：
[{'item': 'diamond_axe', 'type': 'crafting_table'}, {'item': 'diamond_block', ...
"""
```

## 已知问题

~~对于迭代 tag 的存在暂时没有处理。~~ 已经解决。

~~对于 xx_from_xx 类型的多版本合成表暂时未处理。~~ 已经解决。

对于 barrel、campfire、soul_campfire 暂时无法处理。现在是使用 hard code 直接屏蔽掉