import React from "react";
import { Row, Col, Form, Input, Select } from "antd";
import { WEB_STRINGS } from "../../../../constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import "./styles.scss";
import { ButtonComponent } from "../../../../components";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSingleDocterAppointmentRequest } from "../../../../redux/slicers/docters";
import { BASE_URL } from "../../../../config/webService";
import { getAppointmentShiftsRequest } from "../../../../redux/slicers/appointment";
const AppoinmentStep3 = ({ stepData, pagination, onSubmit, previousStep }) => {
  const { TextArea } = Input;
  const { formSteps, step3 } = WEB_STRINGS.Appoinment;
  const { dr } = useParams();
  const dispatch = useDispatch();
  const state = useSelector((state) => state);

  const { docters, appointment, user } = state;

  const { singleDocter } = docters;

  const isAdmin = user?.user?.isAdmin;

  const [form] = Form.useForm();
  const handleSubmit = () => {
    const values = form.getFieldsValue();
    onSubmit(values);
  };
  useEffect(() => {
    dispatch(
      getSingleDocterAppointmentRequest({
        payloadData: dr,
        responseCallback: (status, res) => {
          if (status) {
          } else {
          }
        },
      })
    );
    dispatch(
      getAppointmentShiftsRequest({
        payloadData: "",
        responseCallback: (status, res) => {
          if (status) {
          } else {
          }
        },
      })
    );
    form.setFieldsValue({ ...stepData });
  }, []);

  return (
    <Form className="appoinment-step" form={form} onFinish={handleSubmit}>
      <div className="card-box">
        {pagination()}
        <div className="title">
          <div
            style={{
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
            }}
            onClick={previousStep}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
            <h4>{formSteps[2]}</h4>
          </div>
        </div>
        <Row gutter={[24, 16]}>
          <Col xs={24}>
            <div className="doctor-profile">
              <div className="thumb">
                <img src={`${singleDocter?.profileImage?.url}`} alt="" />
              </div>
              <div className="detail">
                <h4>{singleDocter?.Name}</h4>
                <p>
                  {singleDocter?.specialities?.length
                    ? singleDocter?.specialities[0]?.name
                    : ""}
                </p>
              </div>
            </div>
          </Col>
          {step3.fields.map((item, index) => (
            <Col md={item.isTextArea ? 24 : 12} xs={24} key={index}>
              <label>{item.label}</label>
              <Form.Item name={item.title} rules={item.rules}>
                {item.isTextArea ? (
                  <TextArea
                    rows={7}
                    placeholder={item.placeholder}
                    className="form-input"
                  />
                ) : item.title === "preferred_appointment_time" ? (
                  <Select
                    placeholder={item.placeholder}
                    className="form-select"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {appointment?.slots?.map((data, index) => (
                      <Select.Option value={data?.id} key={index}>
                        {data.label}
                      </Select.Option>
                    ))}
                  </Select>
                ) : (
                  <Select
                    placeholder={item.placeholder}
                    className="form-select"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {item.options.map((data, index) => (
                      <Select.Option value={data.value} key={index}>
                        {data.label}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
          ))}
        </Row>
      </div>
      <div className="btn-wrapper">
        <ButtonComponent text={isAdmin ? "Update Appointment" : step3.btn} />
      </div>
    </Form>
  );
};

export default AppoinmentStep3;
