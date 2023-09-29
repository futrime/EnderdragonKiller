import os
import json
import copy


class KnowledgeBase:
    def __init__(
        self,
        base_path: str = "./knowledge_base",
        recipe: bool = True,
        loot: bool = True,
    ):
        """
        :param base_path: str, path to the knowledge base
        :param recipe: load recipe or not
        :param loot: load loot or not
        """
        self.__base_path = base_path
        self.Load(recipe, loot)

    def Load(self, recipe: bool = True, loot: bool = True):
        """
        :param recipe: load recipe or not
        :param loot: load loot or not
        """
        self.__recipe = recipe
        self.__loot = loot
        self.__material_to_crafted = {}
        self.__crafted_to_material = {}
        if self.__recipe:
            self.__LoadRecipe()
        if self.__loot:
            self.__LoadLoot()

    def __LoadShapeless(self, recipe):
        """
        :param recipe: dict, a shapeless recipe
        Load a shapeless recipe
        """
        craft_num = len(recipe["ingredients"])
        if craft_num > 4:
            recipe_type = "crafting_table"
        else:
            recipe_type = "player"

        crafted = recipe["result"]["item"].split(":")[1]
        if crafted not in self.__crafted_to_material:
            self.__crafted_to_material[crafted] = []

        this_recipe = [{"recipe": {}, "type": recipe_type}]

        for ingredient in recipe["ingredients"]:
            if "item" in ingredient:
                if ingredient["item"].split(":")[1] not in self.__material_to_crafted:
                    self.__material_to_crafted[ingredient["item"].split(":")[1]] = [
                        {"item": crafted, "type": recipe_type}
                    ]
                else:
                    for item in self.__material_to_crafted[
                        ingredient["item"].split(":")[1]
                    ]:
                        if item["item"] == crafted:
                            break
                    else:
                        self.__material_to_crafted[
                            ingredient["item"].split(":")[1]
                        ].append({"item": crafted, "type": recipe_type})
                if ingredient["item"].split(":")[1] not in this_recipe[0]["recipe"]:
                    this_recipe[0]["recipe"][ingredient["item"].split(":")[1]] = 1
                else:
                    this_recipe[0]["recipe"][ingredient["item"].split(":")[1]] += 1

        for ingredient in recipe["ingredients"]:
            if isinstance(ingredient, list):
                if len(this_recipe) == 1:
                    for _ in range(len(ingredient) - 1):
                        this_recipe.append(copy.deepcopy(this_recipe[0]))
                for ind, item_ in enumerate(ingredient):
                    if item_["item"].split(":")[1] not in self.__material_to_crafted:
                        self.__material_to_crafted[item_["item"].split(":")[1]] = [
                            {"item": crafted, "type": recipe_type}
                        ]
                    else:
                        for item in self.__material_to_crafted[
                            item_["item"].split(":")[1]
                        ]:
                            if item["item"] == crafted:
                                break
                        else:
                            self.__material_to_crafted[
                                item_["item"].split(":")[1]
                            ].append({"item": crafted, "type": recipe_type})
                    if item_["item"].split(":")[1] not in this_recipe[ind]["recipe"]:
                        this_recipe[ind]["recipe"][item_["item"].split(":")[1]] = 1
                    else:
                        this_recipe[ind]["recipe"][item_["item"].split(":")[1]] += 1
        for ingredient in recipe["ingredients"]:
            if "tag" in ingredient:
                tag = ingredient["tag"].split(":")[1]
                with open(f"{self.__base_path}/tags/items/{tag}.json", "r") as f:
                    tag = json.load(f)
                    recipe_list = tag["values"]
                    for item in recipe_list:
                        if item.startswith("#minecraft:"):
                            recipe_list.remove(item)
                            with open(
                                f"{self.__base_path}/tags/items/{item.split(':')[1]}.json",
                                "r",
                            ) as f:
                                tag = json.load(f)
                                recipe_list.extend(tag["values"])
                    if len(this_recipe) == 1:
                        for _ in range(len(recipe_list) - 1):
                            this_recipe.append(copy.deepcopy(this_recipe[0]))
                    for ind, item_ in enumerate(recipe_list):
                        if item_.split(":")[1] not in self.__material_to_crafted:
                            self.__material_to_crafted[item_.split(":")[1]] = [
                                {"item": crafted, "type": recipe_type}
                            ]
                        else:
                            for item in self.__material_to_crafted[item_.split(":")[1]]:
                                if item["item"] == crafted:
                                    break
                            else:
                                self.__material_to_crafted[item_.split(":")[1]].append(
                                    {"item": crafted, "type": recipe_type}
                                )
                        if item_.split(":")[1] not in this_recipe[ind]["recipe"]:
                            this_recipe[ind]["recipe"][item_.split(":")[1]] = 1
                        else:
                            this_recipe[ind]["recipe"][item_.split(":")[1]] += 1
        self.__crafted_to_material[crafted].extend(this_recipe)

    def __LoadShaped(self, recipe):
        """
        :param recipe: dict, a shaped recipe
        Load a shaped recipe
        """
        for line in recipe["pattern"]:
            if len(line) >= 3:
                recipe_type = "crafting_table"
                break
        else:
            if len(recipe["pattern"]) >= 3:
                recipe_type = "crafting_table"
            else:
                recipe_type = "player"

        crafted = recipe["result"]["item"].split(":")[1]
        if crafted in ["barrel", "campfire", "soul_campfire"]:
            return
        if crafted not in self.__crafted_to_material:
            self.__crafted_to_material[crafted] = []

        this_recipe = [{"recipe": {}, "type": recipe_type}]

        keyToNum = {}
        for line in recipe["pattern"]:
            for char in line:
                if char == " ":
                    continue
                if char not in keyToNum:
                    keyToNum[char] = 1
                else:
                    keyToNum[char] += 1

        for key in recipe["key"]:
            if "item" in recipe["key"][key]:
                if (
                    recipe["key"][key]["item"].split(":")[1]
                    not in self.__material_to_crafted
                ):
                    self.__material_to_crafted[
                        recipe["key"][key]["item"].split(":")[1]
                    ] = [{"item": crafted, "type": recipe_type}]
                else:
                    for item in self.__material_to_crafted[
                        recipe["key"][key]["item"].split(":")[1]
                    ]:
                        if item["item"] == crafted:
                            break
                    else:
                        self.__material_to_crafted[
                            recipe["key"][key]["item"].split(":")[1]
                        ].append({"item": crafted, "type": recipe_type})
                this_recipe[0]["recipe"][
                    recipe["key"][key]["item"].split(":")[1]
                ] = keyToNum[key]

        reqNum = 1
        for key in recipe["key"]:
            if "tag" in recipe["key"][key]:
                tag = recipe["key"][key]["tag"].split(":")[1]
                with open(f"{self.__base_path}/tags/items/{tag}.json", "r") as f:
                    tag = json.load(f)
                    recipe_list = tag["values"]
                    for item in recipe_list:
                        if item.startswith("#minecraft:"):
                            recipe_list.remove(item)
                            with open(
                                f"{self.__base_path}/tags/items/{item.split(':')[1]}.json",
                                "r",
                            ) as f:
                                tag = json.load(f)
                                recipe_list.extend(tag["values"])
                    reqNum = len(recipe_list) * reqNum
            if isinstance(recipe["key"][key], list):
                reqNum = len(recipe["key"][key]) * reqNum

        if reqNum > 1:
            for _ in range(reqNum - 1):
                this_recipe.append(copy.deepcopy(this_recipe[0]))
            flag = False
            for key in recipe["key"]:
                if isinstance(recipe["key"][key], list):
                    flag = True
                    stride = reqNum // len(recipe["key"][key])
                    for ind, item_ in enumerate(recipe["key"][key]):
                        if (
                            item_["item"].split(":")[1]
                            not in self.__material_to_crafted
                        ):
                            self.__material_to_crafted[item_["item"].split(":")[1]] = [
                                {"item": crafted, "type": recipe_type}
                            ]
                        else:
                            for item in self.__material_to_crafted[
                                item_["item"].split(":")[1]
                            ]:
                                if item["item"] == crafted:
                                    break
                            else:
                                self.__material_to_crafted[
                                    item_["item"].split(":")[1]
                                ].append({"item": crafted, "type": recipe_type})
                        for i in range(ind * stride, (ind + 1) * stride):
                            this_recipe[i]["recipe"][
                                item_["item"].split(":")[1]
                            ] = keyToNum[key]

            for key in recipe["key"]:
                if "tag" in recipe["key"][key]:
                    tag = recipe["key"][key]["tag"].split(":")[1]
                    with open(f"{self.__base_path}/tags/items/{tag}.json", "r") as f:
                        tag = json.load(f)
                        recipe_list = tag["values"]
                        for item in recipe_list:
                            if item.startswith("#minecraft:"):
                                recipe_list.remove(item)
                                with open(
                                    f"{self.__base_path}/tags/items/{item.split(':')[1]}.json",
                                    "r",
                                ) as f:
                                    tag = json.load(f)
                                    recipe_list.extend(tag["values"])
                        stride = reqNum // len(recipe_list)
                        for ind, item_ in enumerate(recipe_list):
                            if item_.split(":")[1] not in self.__material_to_crafted:
                                self.__material_to_crafted[item_.split(":")[1]] = [
                                    {"item": crafted, "type": recipe_type}
                                ]
                            else:
                                for item in self.__material_to_crafted[
                                    item_.split(":")[1]
                                ]:
                                    if item["item"] == crafted:
                                        break
                                else:
                                    self.__material_to_crafted[
                                        item_.split(":")[1]
                                    ].append({"item": crafted, "type": recipe_type})
                            if not flag:
                                for i in range(ind * stride, (ind + 1) * stride):
                                    this_recipe[i]["recipe"][
                                        item_.split(":")[1]
                                    ] = keyToNum[key]
                            else:
                                for i in range(ind, reqNum, stride):
                                    this_recipe[i]["recipe"][
                                        item_.split(":")[1]
                                    ] = keyToNum[key]

        self.__crafted_to_material[crafted].extend(this_recipe)

    def __LoadFurnace(self, recipe):
        """
        :param recipe: dict, a furnace recipe
        Load a furnace recipe
        """
        crafted = recipe["result"].split(":")[1]

        recipe_type = "furnace"

        if crafted not in self.__crafted_to_material:
            self.__crafted_to_material[crafted] = []

        this_recipe = [{"recipe": {}, "type": recipe_type}]

        if "item" in recipe["ingredient"]:
            if (
                recipe["ingredient"]["item"].split(":")[1]
                not in self.__material_to_crafted
            ):
                self.__material_to_crafted[
                    recipe["ingredient"]["item"].split(":")[1]
                ] = [{"item": crafted, "type": recipe_type}]
            else:
                for item in self.__material_to_crafted[
                    recipe["ingredient"]["item"].split(":")[1]
                ]:
                    if item["item"] == crafted:
                        break
                else:
                    self.__material_to_crafted[
                        recipe["ingredient"]["item"].split(":")[1]
                    ].append({"item": crafted, "type": recipe_type})
            this_recipe[0]["recipe"][recipe["ingredient"]["item"].split(":")[1]] = 1

        if isinstance(recipe["ingredient"], list):
            for _ in range(len(recipe["ingredient"]) - 1):
                this_recipe.append(copy.deepcopy(this_recipe[0]))
            for ind, item in enumerate(recipe["ingredient"]):
                if item["item"].split(":")[1] not in self.__material_to_crafted:
                    self.__material_to_crafted[item["item"].split(":")[1]] = [
                        {"item": crafted, "type": recipe_type}
                    ]
                else:
                    for item in self.__material_to_crafted[item["item"].split(":")[1]]:
                        if item["item"] == crafted:
                            break
                    else:
                        self.__material_to_crafted[item["item"].split(":")[1]].append(
                            {"item": crafted, "type": recipe_type}
                        )
                this_recipe[ind]["recipe"][item["item"].split(":")[1]] = 1

        self.__crafted_to_material[crafted].extend(this_recipe)

    def __LoadRecipe(self):
        """
        Load recipe from knowledge base
        """
        recipe_path = f"{self.__base_path}/recipes"

        for recipe_file in os.listdir(recipe_path):
            with open(f"{recipe_path}/{recipe_file}", "r") as f:
                recipe = json.load(f)
                craft_type = recipe["type"]

                if craft_type == "minecraft:crafting_shapeless":
                    self.__LoadShapeless(recipe)
                elif craft_type == "minecraft:crafting_shaped":
                    self.__LoadShaped(recipe)
                elif craft_type == "minecraft:smelting":
                    self.__LoadFurnace(recipe)

    def __LoadLootTable(self, loot, name):
        """
        :param loot: dict, a loot table
        Load a loot table
        """
        if "pools" not in loot:
            return

        recipe_type = "combat"

        for pool in loot["pools"]:
            for item in pool["entries"]:
                if "name" not in item:
                    continue
                item_name = item["name"].split(":")[1]
                if item_name not in self.__crafted_to_material:
                    self.__crafted_to_material[item_name] = [
                        {"recipe": {name: 1}, "type": recipe_type}
                    ]
                else:
                    for item_ in self.__crafted_to_material[item_name]:
                        if item_["recipe"] == {name: 1}:
                            break
                    else:
                        self.__crafted_to_material[item_name].append(
                            {"recipe": {name: 1}, "type": recipe_type}
                        )
                if name not in self.__material_to_crafted:
                    self.__material_to_crafted[name] = [
                        {"item": item_name, "type": recipe_type}
                    ]
                else:
                    for item_ in self.__material_to_crafted[name]:
                        if item_["item"] == item_name:
                            break
                    else:
                        self.__material_to_crafted[name].append(
                            {"item": item_name, "type": recipe_type}
                        )

    def __LoadLoot(self):
        """
        Load loot from knowledge base
        """

        loot_path = f"{self.__base_path}/loot_tables/entities"
        for loot_file in os.listdir(loot_path):
            if loot_file.endswith(".json"):
                with open(f"{loot_path}/{loot_file}", "r") as f:
                    loot = json.load(f)
                    self.__LoadLootTable(loot, loot_file.split(".")[0])

    @property
    def material_to_crafted(self):
        return self.__material_to_crafted

    @property
    def crafted_to_material(self):
        return self.__crafted_to_material
