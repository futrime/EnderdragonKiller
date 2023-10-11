import knowledge_base as kblib


def main() -> None:
    kb = kblib.KnowledgeBase()
    ingredients_of_beacon = kb.crafted_to_material["beacon"]
    print(ingredients_of_beacon)


if __name__ == "__main__":
    main()
