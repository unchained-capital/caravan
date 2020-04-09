import React from "react";
import "./styles.css";

class Card extends React.Component {
  render() {
    return (
      <div className="card custom-card">
        <div className="card-header">
          <h5>{this.props.title}</h5>
        </div>
        <div className="card-body">{this.props.children}</div>
      </div>
    );
  }
}

export default Card;
