import React from "react";
import { Row, Col, Button } from "reactstrap";

export default props => {
  return (
    <div>
      <Row noGutters className="text-center align-items-center room-cta">
        <Col>
          <p className="looking-for-room">
            Professional Dance Studio
          </p>
          <Button
            color="none"
            className="custom-btn"
            onClick={_ => {
              props.setPage(1);
            }}
          >
            Reserve a Room
          </Button>
        </Col>
      </Row>
      <Row noGutters className="text-center big-img-container">
        <Col>
          <img
            src={require("../images/cafe.jpg")}
            alt="cafe"
            className="big-img"
          />
        </Col>
      </Row>
    </div>
  );
};
