import * as React from 'react';
import { Router, Route, Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { Container, Form, FormGroup, Label, FormText, Input, Row, Col, NavbarBrand, Navbar, NavbarToggler, Collapse, Nav, NavItem, NavLink, Card, CardImg, CardTitle, CardBody, CardColumns, CardText, Table, Badge, Button } from 'reactstrap';
import { FaClock, FaUtensils, FaTachometerAlt, FaFlagCheckered, FaHourglass } from 'react-icons/fa';
import { GoFlame } from 'react-icons/go';
import InputRange from 'react-input-range';
import CreatableSelect from 'react-select/lib/Creatable';
import * as queryString from 'query-string';
import update from 'immutability-helper';
import './App.css';
import recipes from './recipes.json';
import ingredients from './ingredients.json';
import history from './history';
import 'react-input-range/lib/css/index.css';

const recipeWithId = (recipeId: number) => recipes[recipeId - 1429];
const imageUrlWithId = (recipeId: number) => '/imgs/' + recipeId.toString() + '.jpg';


interface Ingredient {
  name: string;
  detail?: string;
  amount?: string;
  marking?: string;
}
  
interface Recipe {
  id: number;
  title: string;
  cook_duration: number;
  calorie: number;
  genre: string;
  kind: string;
  difficulty: string;
  prep_duration: number;
  comment: string;
  ingredients: Ingredient[]
  yield: number;
  instructions: string[]
}


interface IngredientItem {
  value: string;
  kana?: string;
  alt?: string[];
}


interface DurationRange {
  min?: number;
  max?: number;
}

function durationRangeToRange(dr: DurationRange | undefined, mx: number) {
  let res = { min: 0, max: mx };
  if (!dr) { return res; }
  if (dr.max) { res.max = dr.max; }
  if (dr.min) { res.min = dr.min; }
  return res;
}

function rangeToDurationRange(r: DurationRange, mx: number): DurationRange {
  let res: DurationRange = Object.assign(r);
  if (res.min === 0) { res.min = undefined; }
  if (res.max === mx) { res.max = undefined; }
  return res;
}

function serializeDurationRange(dr: DurationRange): string {
  let res = ''
  if (dr.min) { res += dr.min.toString(); }
  res += '-';
  if (dr.max) { res += dr.max.toString(); }
  return res;
}

function deserializeDurationRange(s: string): DurationRange {
  let res: DurationRange = {};
  const p = s.split('-');
  if (p[0].length > 0) { res.min = Number.parseInt(p[0]); }
  if (p[1].length > 0) { res.max = Number.parseInt(p[1]); }
  return res;
}

function matchDuration(n: number, crit: DurationRange) {
  if (crit.min && n < crit.min) { return false; }
  if (crit.max && n > crit.max) { return false; }
  return true;
}

function describeDuration(dr: DurationRange) {
  let res = '';
  if (dr.min) { res += dr.min.toString(); }
  res += '～';
  if (dr.max) { res += dr.max.toString(); }
  res += '分';
  return res;
}

interface SearchQuery {
  keyword?: string;
  genre?: string[];
  kind?: string[];
  difficulty?: string[];
  cookDuration?: DurationRange;
  prepDuration?: DurationRange;
  ingredients?: string[];
  excludeIngredients?: string[];
}

function deserializeSearchQuery(urlQuery: string): SearchQuery {
  const p = queryString.parse(urlQuery) as any;
  let res: SearchQuery = {}
  if ('kw' in p) { res.keyword = p['kw']; }
  if ('g' in p) { res.genre = p['g'].split(','); }
  if ('k' in p) { res.kind = p['k'].split(','); }
  if ('d' in p) { res.difficulty = p['d'].split(','); }
  if ('cd' in p) { res.cookDuration = deserializeDurationRange(p['cd']); }
  if ('pd' in p) { res.prepDuration = deserializeDurationRange(p['pd']); }
  if ('i' in p) { res.ingredients = p['i'].split(','); }
  if ('ei' in p) { res.excludeIngredients = p['ei'].split(','); }
  return res;
}


function serializeSearchQuery(q: SearchQuery): string {
  let res = {};
  if (q.keyword && q.keyword.length > 0) { res['kw'] = q.keyword; }
  if (q.genre && q.genre.length > 0) { res['g'] = q.genre.join(','); }
  if (q.kind && q.kind.length > 0) { res['k'] = q.kind.join(','); }
  if (q.difficulty && q.difficulty.length > 0) { res['d'] = q.difficulty.join(','); }
  if (q.cookDuration && serializeDurationRange(q.cookDuration) !== '-') { res['cd'] = serializeDurationRange(q.cookDuration); }
  if (q.prepDuration && serializeDurationRange(q.prepDuration) !== '-') { res['pd'] = serializeDurationRange(q.prepDuration); }
  if (q.ingredients) { res['i'] = q.ingredients.join(','); }
  if (q.excludeIngredients) { res['ei'] = q.excludeIngredients.join(','); }
  return queryString.stringify(res);
}

function describeSearchQuery(q: SearchQuery): string {
  let p = [];
  if (q.keyword) { p.push('キーワード："' + q.keyword + '"'); }
  if (q.genre) { p.push('ジャンル：' + q.genre.join('，')); }
  if (q.kind) { p.push('種類：' + q.kind.join('，')); }
  if (q.difficulty) { p.push('難易度：' + q.difficulty.join('，')); }
  if (q.cookDuration) { p.push('加熱時間：' + describeDuration(q.cookDuration)); }
  if (q.prepDuration) { p.push('準備時間：' + describeDuration(q.prepDuration)); }
  if (q.ingredients) { p.push('材料：' + q.ingredients.join('，')); }
  if (q.excludeIngredients) { p.push('使わない材料：' + q.excludeIngredients.join('，')); }
  return p.join('　');
}

function shouldContain(q: SearchQuery, r: Recipe): boolean {
  if (q.keyword && !r.title.includes(q.keyword) && !r.comment.includes(q.keyword)) { return false; }
  if (q.difficulty && q.difficulty.indexOf(r.difficulty) === -1) { return false; }
  if (q.genre && q.genre.indexOf(r.genre) === -1) { return false; }
  if (q.kind && q.kind.indexOf(r.kind) === -1) { return false; }
  if (q.cookDuration && !matchDuration(r.cook_duration, q.cookDuration)) { return false; }
  if (q.prepDuration && !matchDuration(r.prep_duration, q.prepDuration)) { return false; }
  if (q.ingredients || q.excludeIngredients) {
    const ings = new Set(r.ingredients.map((ing) => ing.name));
    if (q.ingredients) {
      for (const candsStr of q.ingredients) {
        const cands = candsStr.split('|');
        if (!cands.some((s) => ings.has(s))) { return false; }
      }
    }
    if (q.excludeIngredients) {
      if (q.excludeIngredients.some((s) => ings.has(s))) { return false; }
    }
  }
  return true;
}

class AppNavbar extends React.Component<{}, { isOpen: boolean }> {
  constructor(props: {}) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = { isOpen: false }
  }
  public render() {
    return (
      <Navbar color="light" sticky="top" light expand="sm">
        <NavbarBrand><Link to='/'>C4M-E Recipes</Link></NavbarBrand>
        <NavbarToggler onClick={this.toggle} />
        <Collapse isOpen={this.state.isOpen} navbar>
          <Nav className="ml-auto" navbar>
            <NavItem><NavLink href="/?k=前菜">前菜</NavLink></NavItem>
            <NavItem><NavLink href="/?k=メインディッシュ">メインディッシュ</NavLink></NavItem>
            <NavItem><NavLink href="/?k=デザート">デザート</NavLink></NavItem>
          </Nav>
        </Collapse>
      </Navbar>
    );
  }

  private toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
}

const IngredientRow = (props: { ing: Ingredient }) => {
  return (<tr><td><Badge color="secondary">{props.ing.marking}</Badge></td><td>{props.ing.name}</td><td>{props.ing.detail}</td><td>{props.ing.amount}</td></tr>);
}

const RecipeDetail = (props: RouteComponentProps<{ id: string }>) => {
  const recipeId = parseInt(props.match.params.id);
  const recipe = recipeWithId(recipeId);
  return (
    <div>
      <Row>
        <Col>
          <img className="rounded float-right" src={imageUrlWithId(recipe.id)} />
          <h1 className="display-4">{recipe.title}</h1>
          <p className="lead">{recipe.comment}</p>
          <p>
            <FaClock />時間：{recipe.prep_duration + recipe.cook_duration}分（準備{recipe.prep_duration}分、加熱{recipe.cook_duration}分）<br />
            <FaUtensils />種類：{recipe.kind}<br />
            <FaTachometerAlt />難易度：{recipe.difficulty}<br />
            <FaFlagCheckered />ジャンル：{recipe.genre}<br />
            <GoFlame />カロリー：{recipe.calorie}kcal
          </p>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md="6" lg="5">
          <h3 className="mb-3">材料（{recipe.yield}人分）</h3>
          <Table hover size="sm">
            <tbody>
              {recipe.ingredients.map((ing, i) => {
                return <IngredientRow key={i} ing={ing} />;
              })}
            </tbody>
          </Table>
        </Col>
        <Col md="6" lg="7">
          <h3>手順</h3>
          <ol className="instructions">
            {recipe.instructions.map((s, i) => {
              return <li key={i}>{s}</li>
            })}
          </ol>
        </Col>
      </Row>
    </div>
  );
}

const RecipeItem = (props: { r: Recipe }) => (
  <Card>
    <CardImg top width="100%" src={imageUrlWithId(props.r.id)} />
    <CardBody>
      <CardTitle><Link to={'/detail/' + props.r.id.toString()}>{props.r.title}</Link></CardTitle>
      <CardText>{props.r.comment}</CardText>
      <CardText>
        <FaClock />準備時間：{props.r.prep_duration}分<br />
        <FaHourglass />加熱時間：{props.r.cook_duration}分<br />
        <FaUtensils />種類：{props.r.kind}<br />
        <FaTachometerAlt />難易度：{props.r.difficulty}<br />
        <FaFlagCheckered />ジャンル：{props.r.genre}<br />
        <GoFlame />カロリー：{props.r.calorie}kcal
      </CardText>
    </CardBody>
  </Card>
);

interface CheckBoxRowProps {
  key_: string;
  title: string;
  values: string[];
  checked: string[] | undefined;
  cb: (k: string, v: ReadonlyArray<string>) => void;
}

class CheckBoxRow extends React.Component<CheckBoxRowProps, {}> {
  constructor(props: CheckBoxRowProps) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  public render() {
    return (
      <Row>
        <Col xs={4}><Label>{this.props.title}</Label>
        </Col>
        <Col>
          {this.props.values.map((val, i) => {
            return (
              <FormGroup inline check key={i}>
                <Label check><Input type="checkbox" value={val} checked={this.props.checked !== undefined && this.props.checked.indexOf(val) !== -1} onClick={this.onClick} />{val}</Label>
              </FormGroup>
            );
          })}
        </Col>
      </Row>
    );
  }

  private onClick(e: React.FormEvent<HTMLInputElement>) {
    const val = e.currentTarget.value;
    const checked = this.props.checked !== undefined ? this.props.checked : [];
    const idx = checked.indexOf(val);
    if (idx !== -1) {
      this.props.cb(this.props.key_, update(checked, { $splice: [[idx, 1]] }));
    } else {
      this.props.cb(this.props.key_, update(checked, { $push: [val] }));
    }
  }
}

interface SliderRowProps {
  key_: string;
  title: string;
  unit: string;
  max: number;
  range?: DurationRange;
  cb: (k: string, v: DurationRange) => void;
}

class SliderRow extends React.Component<SliderRowProps> {

  constructor(props: SliderRowProps) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.format = this.format.bind(this);
  }

  public render() {
    return (
      <Row>
        <Col xs={4}><Label>{this.props.title}</Label>
        </Col>
        <Col>
          <InputRange formatLabel={this.format} value={durationRangeToRange(this.props.range, this.props.max)} minValue={0} maxValue={this.props.max} onChange={this.handleChange} />
        </Col>
      </Row>
    )
  }

  private format(value: number) {
    return `${value}${this.props.unit}`;
  }

  private handleChange(value: any) {
    this.props.cb(this.props.key_, rangeToDurationRange(value, this.props.max));
  }

}

interface SidebarContext {
  query: SearchQuery;
  options: IngredientItem[];
}

const value2ingredientItem = new Map<string, IngredientItem>();
ingredients.forEach((group) => group.options.forEach((item) => value2ingredientItem.set(item.value, item)));

class Sidebar extends React.Component<{ query: SearchQuery }, SidebarContext> {
  private readonly GENRES = { key_: 'genre', title: 'ジャンル', values: ['エスニック', '和風', '洋風', '中華風', 'フレンチ'] };
  private readonly DIFFICULTY = { key_: 'difficulty', title: '難易度', values: ['簡単', '普通'] };
  private readonly KIND = { key_: 'kind', title: '種類', values: ['前菜', 'メインディッシュ', 'デザート'] };

  constructor(props: { query: SearchQuery } ) {
    super(props);
    this.state = { query: Object.assign({}, props.query), options: this.queryOption2selectOption(props.query.ingredients) };
    this.onSubmit = this.onSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleRange = this.handleRange.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.shouldCreateEnabled = this.shouldCreateEnabled.bind(this);
    this.createNewOption = this.createNewOption.bind(this);
    this.filter = this.filter.bind(this);
    this.cb = this.cb.bind(this);
  }

  public cb(k: string, v: any) {
    // console.log(k, v);
    this.setState({ query: update(this.state.query, {$merge: { [k]: v }})});
  }

  public handleSelectChange(newValue: any, actionMeta: any) {
    console.log(newValue);
    console.log(actionMeta.action);
    if (actionMeta.action === 'select-option' || actionMeta.action === 'remove-value' || actionMeta.action === 'clear' || actionMeta.action === 'create-option') {
      this.setState( { options: newValue } );
    }
  }

  public shouldCreateEnabled(inputValue: string, selectValue: any, options: any) {
    if (!inputValue) { return false; }
    // FIXME: return false if input value has no regex-match to options
    return true;
  }

  public createNewOption(inputValue: string, optionLabel: React.ReactNode) {
    console.log(inputValue, optionLabel);
    // FIXME: regex -> '|' delimited list of string
    return { value: inputValue }; // '青ねぎ|青しそ';
  }

  public filter(option: any, inputValue: string) {
    const re = RegExp(inputValue);
    return re.test(option.value);
  }

  public queryOption2selectOption(options: string[] | undefined): IngredientItem[] {
    if (!options) {
      return [];
    }
    function notUndefined<T>(v: T | undefined): v is T { return v !== undefined; }
    return options.map(v => value2ingredientItem.get(v)).filter(notUndefined);
  }

  public selectOption2queryOption(options: IngredientItem[]) {
    if (options.length === 0) {
      return undefined;
    }
    return options.map(v => v.value);
  }

  public render() {
    const {query, options} = this.state;
    return (
      <Form onSubmit={this.onSubmit}>
        <FormGroup row>
          <Label for="keyword" hidden={true}>キーワード</Label>
          <Input className="m-2" type="text" name="keyword" id="keyword" placeholder="キーワード" value={query.keyword} onChange={this.handleChange} />
        </FormGroup>
        <CheckBoxRow {...this.GENRES} checked={query.genre} cb={this.cb} />
        <CheckBoxRow {...this.DIFFICULTY} checked={query.difficulty} cb={this.cb} />
        <CheckBoxRow {...this.KIND} checked={query.kind} cb={this.cb} />
        <SliderRow key_="prepDuration" title="準備時間" unit="分" max={75} range={query.prepDuration} cb={this.cb} />
        <SliderRow key_="cookDuration" title="加熱時間" unit="分" max={35} range={query.cookDuration} cb={this.cb} />
        <CreatableSelect<IngredientItem>
          isClearable
          isSearchable
          isMulti
          closeMenuOnSelect={false}
          onChange={this.handleSelectChange}
          options={ingredients}
          getOptionLabel={ (x: IngredientItem) => x.value }
          getOptionValue={ (x: IngredientItem) => x.value }
          formatGroupLabel={ (x) => (<p>{x['genre']}</p>) }
          value={options}
          isValidNewOption={this.shouldCreateEnabled}
          getNewOptionData={this.createNewOption}
          filterOption={this.filter}
        />
        <Button type="submit">検索</Button>
      </Form>
    )
  }

  private handleRange(key: string, mx: number, value: DurationRange) {
    console.log(key, mx, value, this.state);
    this.cb(key, rangeToDurationRange(value, mx));
  }

  private handleChange(e: React.FormEvent<HTMLInputElement>) {
    this.cb(e.currentTarget.name, e.currentTarget.value);
  }

  private onSubmit(e: React.FormEvent<HTMLFormElement>) {
    let query = this.state.query;
    query.ingredients = this.selectOption2queryOption(this.state.options);
    const q = serializeSearchQuery(query);
    history.push('/?' + q);
    e.preventDefault();
  }
}

const SearchResult = withRouter((props: RouteComponentProps<{}>) => {
  const q = deserializeSearchQuery(props.location.search);
  const results = recipes.filter((r) => shouldContain(q, r));
  return (
    <Row className="page-row">
      <Col md="3" className="sidebar">
        <Sidebar query={q} />
      </Col>
      <Col md="9" className="results">
        <h2>{describeSearchQuery(q)}</h2>
        <CardColumns>
          {results.map((recipe) => {
            return <RecipeItem r={recipe} key={recipe.id} />;
          })}
        </CardColumns>
      </Col>
    </Row>
  );
});

class App extends React.Component {
  public render() {
    return (
      <Router history={history}>
        <div>
          <AppNavbar />
          <Container fluid={true}>
            <Route exact path="/" component={SearchResult} />
            <Route path="/detail/:id" component={RecipeDetail} />
          </Container>
        </div>
      </Router>
    );
  }
}

export default App;
