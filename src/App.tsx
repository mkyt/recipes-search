import * as React from 'react';
import { Router, Route, Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { Container, Row, Col, NavbarBrand, Navbar, NavbarToggler, Collapse, Nav, NavItem, NavLink, Card, CardImg, CardTitle, CardBody, CardColumns, CardText, Table, Badge } from 'reactstrap';
import { FaClockO, FaCutlery, FaDashboard, FaFlagCheckered, FaHourglass2 } from 'react-icons/lib/fa';
import { GoFlame } from 'react-icons/lib/go';
import * as queryString from 'query-string';
import './App.css';
import * as recipes from './recipes.json';
import history from './history';
import { Z_UNKNOWN } from 'zlib';

const recipeWithId = (recipeId: number) => recipes[recipeId - 1429];
const imageUrlWithId = (recipeId: number) => '/imgs/' + recipeId.toString() + '.jpg';

interface DurationRange {
  start?: number;
  end?: number;
}

function serializeDurationRange(dr: DurationRange): string {
  let res = ''
  if (dr.start) { res += dr.start.toString(); }
  res += '-';
  if (dr.end) { res += dr.end.toString(); }
  return res;
}

function deserializeDurationRange(s: string): DurationRange {
  let res: DurationRange = {};
  const p = s.split('-');
  if (p[0].length > 0) { res.start = Number.parseInt(p[0]); }
  if (p[1].length > 0) { res.end = Number.parseInt(p[1]); }
  return res;
}
function matchDuration(n: number, crit: DurationRange) {
  if (crit.start && n < crit.start) { return false; }
  if (crit.end && n > crit.end) { return false; }
  return true;
}

interface SearchQuery {
  keyword?: string;
  genre?: string[];
  kind?: string[];
  difficulty?: string[];
  cookDuration?: DurationRange;
  prepDuration?: DurationRange;
  ingredients?: string[][];
  excludeIngredients?: string[];
}

function deserializeSearchQuery(urlQuery: string): SearchQuery {
  const p = queryString.parse(urlQuery);
  let res: SearchQuery = {}
  if ('kw' in p) { res.keyword = p['kw']; }
  if ('g' in p) { res.genre = p['g'].split(','); }
  if ('k' in p) { res.kind = p['k'].split(','); }
  if ('d' in p) { res.difficulty = p['d'].split(','); }
  if ('cd' in p) { res.cookDuration = deserializeDurationRange(p['cd']); }
  if ('pd' in p) { res.prepDuration = deserializeDurationRange(p['pd']); }
  if ('i' in p) {
    let val = [];
    for (const clause of p['i'].split(',')) {
      val.push(clause.split('|'));
    }
    res.ingredients = val;
  }
  if ('ei' in p) { res.excludeIngredients = p['ei'].split(','); }
  return res;
}


function serializeSearchQuery(q: SearchQuery): string {
  let res = {};
  if (q.keyword) { res['kw'] = q.keyword; }
  if (q.genre) { res['g'] = q.genre.join(','); }
  if (q.kind) { res['k'] = q.kind.join(','); }
  if (q.difficulty) { res['d'] = q.difficulty.join(','); }
  if (q.cookDuration) { res['cd'] = serializeDurationRange(q.cookDuration); }
  if (q.prepDuration) { res['pd'] = serializeDurationRange(q.prepDuration); }
  if (q.ingredients) { res['i'] = q.ingredients.map((v) => v.join('|')).join(',') }
  if (q.excludeIngredients) { res['ei'] = q.excludeIngredients.join(','); }
  return queryString.stringify(res);
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
      for (const cands of q.ingredients) {
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
            <NavItem><NavLink href="/?k=デザート">About</NavLink></NavItem>
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

const RecipeDetail = (props: RouteComponentProps<{ id: number }>) => {
  const recipeId = props.match.params.id;
  const recipe = recipeWithId(recipeId);
  return (
    <div>
      <Row>
        <Col>
          <img className="rounded float-right" src={imageUrlWithId(recipe.id)} />
          <h1 className="display-4">{recipe.title}</h1>
          <p className="lead">{recipe.comment}</p>
          <p>
            <FaClockO />時間：{recipe.prep_duration + recipe.cook_duration}分（準備{recipe.prep_duration}分、加熱{recipe.cook_duration}分）<br />
            <FaCutlery />種類：{recipe.kind}<br />
            <FaDashboard />難易度：{recipe.difficulty}<br />
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
        <FaClockO />準備時間：{props.r.prep_duration}分<br />
        <FaHourglass2 />加熱時間：{props.r.cook_duration}分<br />
        <FaCutlery />種類：{props.r.kind}<br />
        <FaDashboard />難易度：{props.r.difficulty}<br />
        <FaFlagCheckered />ジャンル：{props.r.genre}<br />
        <GoFlame />カロリー：{props.r.calorie}kcal
      </CardText>
    </CardBody>
  </Card>
);

const SearchResult = withRouter((props: RouteComponentProps<{}>) => {
  const q = deserializeSearchQuery(props.location.search);
  const results = recipes.filter((r) => shouldContain(q, r));
  return (
    <div>
      <h2>{JSON.stringify(q)}</h2>
      <CardColumns>
        {results.map((recipe) => {
          return <RecipeItem r={recipe} key={recipe.id} />;
        })}
      </CardColumns>
    </div>
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
