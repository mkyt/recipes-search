import * as React from 'react';
import { Router, Route, Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { Container, Row, Col, NavbarBrand, Navbar, NavbarToggler, Collapse, Nav, NavItem, NavLink, Card, CardImg, CardTitle, CardBody, CardColumns, CardText } from 'reactstrap';
import { FaClockO, FaCutlery, FaDashboard, FaFlagCheckered, FaHourglass2 } from 'react-icons/lib/fa';
import * as queryString from 'query-string';
import './App.css';
import * as recipes from './recipes.json';
import history from './history';


class AppNavbar extends React.Component<{}, {isOpen: boolean}> {
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
            <NavItem><NavLink href="/about">About</NavLink></NavItem>
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

const RecipeDetail = (props: RouteComponentProps<{id: number}>) => {
  const recipeId = props.match.params.id;
  // TODO: add code to show detail
  return (
    <h1>Recipe ID: {recipeId}</h1>
  );
}

const RecipeItem = (props: {r: Recipe}) => (
    <Card>
      <CardImg top width="100%" src={'/imgs/'+props.r.id.toString()+'.jpg'}/>
      <CardBody>
        <CardTitle>{props.r.title}</CardTitle>
        <CardText>{props.r.comment}</CardText>
        <CardText>
          <FaClockO />準備時間：{props.r.prep_duration}分<br/>
          <FaHourglass2 />加熱時間：{props.r.cook_duration}分<br/>
          <FaCutlery/>種類：{props.r.kind}<br/>
          <FaDashboard />難易度：{props.r.difficulty}<br/>
          <FaFlagCheckered/>ジャンル：{props.r.genre}
        </CardText>
      </CardBody>
    </Card>
);

const SearchResult = withRouter((props: RouteComponentProps<{}>) => {
  // TODO: add code to filter using query
  const q = props.location.search;
    return (
    <div>
    <h1>{props.location.search}</h1>
    <CardColumns>
    {recipes.map((recipe) => {
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
        <AppNavbar/>
        <Container fluid={true}>
          <Route exact path="/" component={SearchResult}/>
          <Route path="/detail/:id" component={RecipeDetail}/>
        </Container>
      </div>
      </Router>
    );
  }
}

export default App;
