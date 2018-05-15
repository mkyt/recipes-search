#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from urllib.request import urlopen
import re
import json
from pprint import pprint
from bs4 import BeautifulSoup

BASE_URL = 'http://www.club.t-fal.co.jp'
LIST_URL = BASE_URL + '/recipe/category/c4m-express/{:d}/'
DETAIL_URL = BASE_URL + '/recipe/detail/{:d}/'
LIST_PAGES = (1, 11)


def get(url):
    return BeautifulSoup(urlopen(url).read().decode('utf-8'), 'lxml')


def download(url, to):
    with open(to, 'wb') as f:
        f.write(urlopen(url).read())


def extract_detail(soup, id_):
    # id: int
    # title: string
    # cook_duration: string
    # calorie: int (in kcal)
    # genre : string
    # difficulty : string
    # prep_duration: int (in minutes)
    # comment: string
    # ingredients: list of (name: string  * amount: string)
    # yield: int
    # instructions: list of string
    # img_url: string

    print('parsing detail id={}'.format(id_))

    r = soup.select_one('div[itemtype="http://data-vocabulary.org/Recipe"]')
    title = r.select_one('h2[itemprop="name"]').text
    # assuming one image per recipe
    img_url = BASE_URL + r.select_one('div#recipe_photo img').attrs['src']

    # comment & prep_duration
    s = r.select_one('p[itemprop="summary"]').text
    # s:= '根菜をたっぷりとれるヘルシーおかず。\n\n【準備時間：15分】'
    m = re.search(r'【準備時間：(\d+)分】', s)
    prep_duration = int(m.group(1)) if m is not None else None
    comment = s.split('【')[0].strip()

    cook_duration = int(r.select_one('div#recipe_content ul li.r_time time').text.strip()[:-1])
    calorie = int(r.select_one('div#recipe_content ul li.cal').text.split('：')[-1][:-4])
    genre = r.select_one('div#recipe_content ul li.genre').text.split('：')[-1].strip()
    difficulty = r.select_one('div#recipe_content ul li.level').text.split('：')[-1].strip()
    instructions = [elem.text.strip() for elem in r.select('div#recipe_howto ul li')]

    m = re.match(r'\((\d+)人分', r.select_one('div[itemprop="ingredient"] span[itemprop="yield"]').text)
    yield_ = int(m.group(1)) if m is not None else None

    ing_elem = r.select_one('div[itemprop="ingredient"] dl')

    # special treatment for only_dt (where amount is omitted)
    for elem in ing_elem.select('dt.only_dt'):
        if '）' in elem.text: # fix for ID: 1525
            name, amt = elem.text.split('）')
            elem.string = name + '）'
        else:
            name, amt = elem.text, ''
        dd = soup.new_tag('dd')
        dd.string = amt
        elem.insert_after(dd)

    ingredients = [{'name': name.text.strip(), 'amount': amt.text.strip()} for name, amt in zip(ing_elem.select('dt'), ing_elem.select('dd'))]
    for ingredient in ingredients:
        if ingredient['amount'] == '':
            del ingredient['amount']
        name = ingredient['name']
        marking = None
        if '-' in name and name[name.find('-')+1].isupper():
            name, marking = name.split('-')
            ingredient['name'] = name.strip()
            ingredient['marking'] = marking.strip()
        name = name.replace('）（', '・').replace('(', '（').replace(')', '）')
        name = name.replace('むきえび', 'むきエビ').replace('ナス', 'なす').replace('デミグラスソース缶', 'デミグラスソース').replace('トマトピューレ', 'トマトピュレ').replace('三つ葉', 'みつば').replace('合挽き肉', '合びき肉').replace('人参', 'にんじん').replace('海老', 'えび').replace('豚バラブロック肉', '豚バラブロック').replace('豚バラ薄切り肉', '豚バラ薄切り').replace('豚バラ肉薄切り', '豚バラ薄切り').replace('骨付き鶏もも肉', '骨つき鶏もも肉').replace('鶏がらスープの素', '鶏ガラスープの素').replace('豚肉切りおとし', '豚肉切り落とし').replace('薄切り牛肉', '牛うす切り肉')
        ingredient['name'] = name.strip()
        if name.count('（') == 1:
            name, detail = name.split('（')
            if not detail.endswith('）'):
                print(ingredient['name'])
                import pdb; pdb.set_trace()
            detail = detail[:-1] # remove closing paren
            ingredient['name'] = name.strip()
            ingredient['detail'] = detail.strip()

    return {
        'id': id_,
        'title': title,
        'cook_duration': cook_duration,
        'prep_duration': prep_duration,
        'img_url': img_url,
        'comment': comment,
        'calorie': calorie,
        'genre': genre,
        'difficulty': difficulty,
        'instructions': instructions,
        'yield': yield_,
        'ingredients': ingredients
    }

def cleanup_detail(detail):
    ingredients = []
    for ing in detail['ingredients']:
        if ing['name'] == '':
            continue
        ing['name'].replace('')

def extract_ids(soup):
    res = []
    for elem in soup.select('div.recipe_item p.text a'):
        # elem := "<a href="/recipe/detail/1469/">野菜の肉巻き</a>"
        res.append(int(elem.attrs['href'].split('/')[-2]))
    return res


def obtain_detail(id_):
    soup = get(DETAIL_URL.format(id_))
    return extract_detail(soup, id_)


def obtain_all_ids():
    res = []
    for page in range(*LIST_PAGES):
        soup = get(LIST_URL.format(page))
        res += extract_ids(soup)
    return sorted(res)


def get_recipes():
    recipes = []
    # ids = obtain_all_ids()
    ids = [1429, 1430, 1431, 1432, 1433, 1434, 1435, 1436, 1437, 1438, 1439, 1440, 1441, 1442, 1443, 1444, 1445, 1446, 1447, 1448, 1449, 1450, 1451, 1452, 1453, 1454, 1455, 1456, 1457, 1458, 1459, 1460, 1461, 1462, 1463, 1464, 1465, 1466, 1467, 1468, 1469, 1470, 1471, 1472, 1473, 1474, 1475, 1476, 1477, 1478, 1479, 1480, 1481, 1482, 1483, 1484, 1485, 1486, 1487, 1488, 1489, 1490, 1491, 1492, 1493, 1494, 1495, 1496, 1497, 1498, 1499, 1500, 1501, 1502, 1503, 1504, 1505, 1506, 1507, 1508, 1509, 1510, 1511, 1512, 1513, 1514, 1515, 1516, 1517, 1518, 1519, 1520, 1521, 1522, 1523, 1524, 1525, 1526, 1527, 1528, 1529, 1530, 1531, 1532, 1533, 1534, 1535, 1536, 1537, 1538, 1539, 1540, 1541, 1542, 1543, 1544, 1545, 1546, 1547, 1548, 1549, 1550, 1551, 1552, 1553, 1554, 1555, 1556, 1557, 1558, 1559, 1560, 1561, 1562, 1563, 1564, 1565, 1566, 1567, 1568, 1569, 1570, 1571, 1572, 1573, 1574, 1575, 1576, 1577, 1578]
    for id_ in ids:
        detail = obtain_detail(id_)
        pprint(detail)
        recipes.append(detail)
    json.dump(recipes, open('recipes.json', 'w'), ensure_ascii=False)


def download_images():
    recipes = json.load(open('recipes.json'))
    for r in recipes:
        download(r['img_url'], '{}.jpg'.format(r['id']))


if __name__ == '__main__':
    #get_recipes()
    download_images()
