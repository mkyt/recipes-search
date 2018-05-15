import * as React from 'react';
import { Container, Row, Col, NavbarBrand, Navbar, NavbarToggler, Collapse, Nav, NavItem, NavLink, Card, CardImg, CardTitle, CardBody, CardColumns, CardText } from 'reactstrap';
import { FaClockO, FaDashboard, FaFlagCheckered, FaHourglass2 } from 'react-icons/lib/fa';
import './App.css';
import * as recipes from './recipes.json';


class AppNavbar extends React.Component<{}, {isOpen: boolean}> {
  constructor(props: {}) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = { isOpen: false }
  }
  public render() {
    return (
      <Navbar color="light" sticky="top" light expand="sm">
        <NavbarBrand href="/">C4M-E Recipes</NavbarBrand>
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

const RecipeItem = (props: {r: Recipe}) => (
    <Card>
      <CardImg top width="100%" src={'/imgs/'+props.r.id.toString()+'.jpg'}/>
      <CardBody>
        <CardTitle>{props.r.title}</CardTitle>
        <CardText>{props.r.comment}</CardText>
        <CardText>
          <FaClockO />準備時間：{props.r.prep_duration}分<br/>
          <FaHourglass2 />加熱時間：{props.r.cook_duration}分<br/>
          <FaDashboard />難易度：{props.r.difficulty}<br/>
          <FaFlagCheckered/>ジャンル：{props.r.genre}
        </CardText>
      </CardBody>
    </Card>
);

class App extends React.Component {
  public render() {
    return (
      <div>
        <AppNavbar/>
        <Container fluid={true}>
          <CardColumns>
          {recipes.map((recipe) => {
            return <RecipeItem r={recipe} key={recipe.id} />;
          })}
          </CardColumns>
        </Container>
      </div>
    );
  }
}

export default App;
