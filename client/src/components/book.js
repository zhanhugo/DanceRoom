import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Input,
  Button
} from "reactstrap";

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

export default props => {
  // User's selections
  const [selection, setSelection] = useState({
    date: getToday(),
    time: null,
    duration: null,
    location: null,
    plan: null,
    size: null
  });

  // User's booking details
  const [booking, setBooking] = useState({
    name: "",
    phone: "",
    email: ""
  });

  // List of available times
  const [times, setTimes] = useState([0]);

  // List of potential locations
  const [locations] = useState(["Upstairs", "Downstairs(coming soon)"]);

  // List of possible durations
  const [durations] = useState([
    1, 2, 3
  ])

  // Payment methods
  const [plans] = useState([
    "Pay by Hour",
    "Pay by Headcount"
  ])

  // Page State
  const [next, SetNext] = useState(false)

  // Basic reservation "validation"
  const [reservationError, setReservationError] = useState(false);

  useEffect(() => {
    if (selection.duration && selection.date && selection.size && selection.location) {
      (async _ => {
        setTimes([0])
        let res = await fetch("http://localhost:3001/days?" 
          + "date=" + selection.date 
          + "&size=" + selection.size 
          + "&duration=" + selection.duration 
        );
        res = await res.json();
        setTimes(res);
      })();
    }
  }, [selection.duration, selection.date, selection.size, selection.location]);

  function getToday() {
    var timestamp = new Date();
    timestamp.setHours(0, 0, 0, 0);
    return timestamp
  }

  // Make the reservation if all details are filled out
  const reserve = async _ => {
    if (
      (booking.name.length === 0) |
      (booking.phone.length === 0) |
      (booking.email.length === 0)
    ) {
      console.log("Incomplete Details");
      setReservationError(true);
    } else {
      let res = await fetch("http://localhost:3001/days", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          date: selection.date,
          size: selection.size, 
          duration: selection.duration, 
          start: selection.time
        })
      }).then(props.setPage(2))
      .then( 
        await fetch("http://localhost:3001/reserves", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            date: selection.date,
            size: selection.size, 
            duration: selection.duration, 
            start: selection.time,
            name: booking.name,
            phone: booking.phone,
            email: booking.email
          })
        }).then(
          await fetch('http://localhost:3001/sms', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              to: booking.phone,
              body: getReservations()
            })
          })
        )
      ); 
    }
  };

  // Generate party size dropdown
  const getSizes = _ => {
    let newSizes = [];

    for (let i = 1; i < 7; i++) {
      newSizes.push(
        <DropdownItem
          key={i}
          className="booking-dropdown-item"
          onClick={e => {
            let newSel = {
              ...selection,
              size: i
            };
            setSelection(newSel);
          }}
        >
          {i}
        </DropdownItem>
      );
    }
    return newSizes;
  };

  // Generate locations dropdown
  const getLocations = _ => {
    let newLocations = [];
    locations.forEach(loc => {
      newLocations.push(
        <DropdownItem
          key={loc}
          className="booking-dropdown-item"
          onClick={_ => {
            let newSel = {
              ...selection,
              location: loc
            };
            setSelection(newSel);
          }}
        >
          {loc}
        </DropdownItem>
      );
    });
    return newLocations;
  };

  // Generate durations dropdown
  const getDurations = _ => {
    let newDurations = [];
    durations.forEach(duration => {
      newDurations.push(
        <DropdownItem
          key={duration}
          className="booking-dropdown-item"
          onClick={_ => {
            let newSel = {
              ...selection,
              duration: duration
            };
            setSelection(newSel);
          }}
        >
          {duration}
        </DropdownItem>
      );
    });
    return newDurations;
  }

  // Generate times dropdown
  const getTimes = _ => {
    let newTimes = [];
    times.forEach(time => {
      newTimes.push(
        <Button
          key={time}
          className="custom-btn"
          onClick={_ => {
            let newSel = {
              ...selection,
              time: time
            };
            setSelection(newSel);
          }}
        >
          {(time - 1) % 12 + 1} {time < 12 ? "am" : "pm"}
        </Button>
      );
    });
    return newTimes;
  };

  // Generate locations dropdown
  const getPlans = _ => {
    let newPlans = [];
    plans.forEach(plan => {
      newPlans.push(
        <DropdownItem
          key={plan}
          className="booking-dropdown-item"
          onClick={_ => {
            let newSel = {
              ...selection,
              size: plan === "Pay by Hour" ? 6 : null,
              plan: plan
            };
            setSelection(newSel);
          }}
        >
          {plan}
        </DropdownItem>
      );
    });
    return newPlans;
  };

  const getReservations = _ => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = selection.date.toLocaleDateString("en-US", options);
    const time = (selection.time % 12) + " " + (selection.time < 12 ? "am" : "pm")
    return "You are reserving " + selection.location + " at " + time + " for " + selection.duration + (selection.duration === 1 ? " hour" : " hours") + " on " + date
  }

  return (
    <div>
      <Row noGutters className="text-center align-items-center room-cta">
        <Col>
          <p className="looking-for-room">
            {!next ? "Reserve a Room" : "Confirm Reservation"}
          </p>
          <p className="selected-time">
            {next
              ? getReservations()
              : null}
          </p>

          {reservationError ? (
            <p className="reservation-error">
              * Please fill out all of the details.
            </p>
          ) : null}
        </Col>
      </Row>

      {!next ? (
        <div id="reservation-stuff">
          <Row noGutters className="text-center align-items-center">
          <Col xs="12" sm="3">
              <UncontrolledDropdown>
                <DropdownToggle color="none" caret className="booking-dropdown">
                  {selection.location === null ? "Select a Room" : selection.location}
                </DropdownToggle>
                <DropdownMenu right className="booking-dropdown-menu">
                  {getLocations()}
                </DropdownMenu>
              </UncontrolledDropdown>
            </Col>
            <Col xs="12" sm="3">
              <UncontrolledDropdown>
                  <DropdownToggle color="none" caret className="booking-dropdown">
                    {selection.duration === null ? "Select a Duration" : "Duration: " + selection.duration + (selection.duration === 1 ? " Hour": " Hours")}
                  </DropdownToggle>
                  <DropdownMenu right className="booking-dropdown-menu">
                    {getDurations()}
                  </DropdownMenu>
                </UncontrolledDropdown>
            </Col>
            <Col xs="12" sm="3">
              <DatePicker 
              style={{width: "inherit"}}
                type="date"
                required="required"
                className="booking-dropdown"
                selected={selection.date} 
                onChange={ date => { 
                      let newSel = {
                      ...selection,
                      date: date
                    };
                    setSelection(newSel);
                  }
                }
                minDate={new Date()}
              />
            </Col>
            <Col xs="12" sm="3">
              <UncontrolledDropdown>
                <DropdownToggle color="none" caret className="booking-dropdown">
                  {selection.plan === null ? "Select a Payment Plan" : selection.plan}
                </DropdownToggle>
                <DropdownMenu right className="booking-dropdown-menu">
                  {getPlans()}
                </DropdownMenu>
              </UncontrolledDropdown>
            </Col>
            <Col xs="12" sm="3">
              {selection.plan === "Pay by Headcount" ?
                <UncontrolledDropdown>
                  <DropdownToggle color="none" caret className="booking-dropdown">
                    {!selection.size
                      ? "Select a Party Size"
                      : selection.size.toString()}
                  </DropdownToggle>
                  <DropdownMenu right className="booking-dropdown-menu">
                    {getSizes()}
                  </DropdownMenu>
                </UncontrolledDropdown> : ""}
            </Col>
          </Row>
          <Row noGutters className="times-display">
            <Col>
              {selection.location && selection.date && selection.duration && (selection.plan === "Pay by Hour" || selection.size) ? (
                selection.location === "Upstairs" && times.length > 1 ? (
                  <div>
                    <p className="time-display-message">
                      Select a Starting Time
                    </p>
                    {getTimes()}
                  </div>
                ) : (
                  <p className="time-display-message">
                    {selection.location === "Downstairs(coming soon)" || times.length === 0 ? "No Available Times" : "Loading..."}
                  </p>
                )
              ) : (
                <p className="time-display-message">
                  Please fill out the relevant information for your reservation.
                </p>
              )}
            </Col>
          </Row>
          {selection.time ? 
            <Row noGutters className="text-center">
              <Col>
                <Button
                  color="none"
                  className="custom-btn"
                  onClick={_ => {
                    SetNext(true);
                  }}
                >
                  Next
                </Button>
              </Col>
            </Row>
          : null}
        </div>
      ) : (
        <div id="confirm-reservation-stuff">
          <Row
            noGutters
            className="text-center justify-content-center reservation-details-container"
          >
            <Col xs="12" sm="3" className="reservation-details">
              <Input
                type="text"
                bsSize="lg"
                placeholder="Name"
                className="reservation-input"
                value={booking.name}
                onChange={e => {
                  setBooking({
                    ...booking,
                    name: e.target.value
                  });
                }}
              />
            </Col>
            <Col xs="12" sm="3" className="reservation-details">
              <Input
                type="text"
                bsSize="lg"
                placeholder="Phone Number"
                className="reservation-input"
                value={booking.phone}
                onChange={e => {
                  setBooking({
                    ...booking,
                    phone: e.target.value
                  });
                }}
              />
            </Col>
            <Col xs="12" sm="3" className="reservation-details">
              <Input
                type="text"
                bsSize="lg"
                placeholder="Email"
                className="reservation-input"
                value={booking.email}
                onChange={e => {
                  setBooking({
                    ...booking,
                    email: e.target.value
                  });
                }}
              />
            </Col>
          </Row>
          <Row noGutters className="text-center">
            <Col>
              <Button
                color="none"
                className="custom-btn"
                onClick={_ => {
                  reserve();
                }}
              >
                Book Now
              </Button>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};
