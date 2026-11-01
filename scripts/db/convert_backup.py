#!/usr/bin/env python3
import re
import json

with open('backup.sql', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract recipes INSERT
recipes_match = re.search(r"INSERT INTO `recipes` VALUES (.+?)(?:;|\n--)", content, re.DOTALL)
if recipes_match:
    recipes_raw = recipes_match.group(1)
    # Parse each recipe row
    recipe_rows = re.findall(r'\((\d+),[\'"]([^\'"]+)[\'"],([^,]+),\[([^\]]*)\],\[([^\]]*)\],[\'"]([^\'"]*)[\'"],([^,]+),([^,]+),([^,]+),([^,]+),(\d+),(\d+)\)', recipes_raw)

    print("-- Recipes SQL")
    for row in recipe_rows[:10]:  # First 10 recipes
        rid, name_pt, desc, ing_json, inst_json, garnish, method, category, img, author, is_fav, created = row
        desc = desc.replace("'", "''")
        garnish = garnish.replace("'", "''")
        print(f"INSERT INTO recipes (id, name_pt, description, preparation, image_url) VALUES ({rid}, '{name_pt}', '{desc}', 'Ver preparação', '{img}');")
