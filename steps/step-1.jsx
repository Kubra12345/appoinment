import React from "react";
import { Row, Col, Form, Input, Select, DatePicker, AutoComplete } from "antd";
import { WEB_STRINGS } from "../../../../constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { ButtonComponent } from "../../../../components";
import moment from "moment";
import "./styles.scss";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getPatientRequest } from "../../../../redux/slicers/patient";
import { useState } from "react";
import { useLocation } from "react-router-dom";
const AppoinmentStep1 = ({ pagination, stepData, onSubmit, previousStep }) => {
  const { formSteps, step1 } = WEB_STRINGS.Appoinment;
  const state = useSelector((state) => state);
  const dispatch = useDispatch();
  const loc = useLocation();

  const { user, patient, appointment } = state;

  const isAdmin = user?.user?.isAdmin;
  const singleAppoint = appointment?.singleAppointment;

  const [form] = Form.useForm();
  const handleSubmit = () => {
    const values = form.getFieldsValue();
    onSubmit(values);
  };

  const contactYouOptions = user?.user?.user
    ? Object.keys(user?.user?.user)
        ?.filter((dta) => dta === "phoneNumber" || dta === "email")
        .map((dt) => {
          if (dt === "phoneNumber") {
            return { value: user?.user?.user[dt], label: "Phone Number" };
          } else if (dt === "email") {
            return { value: user?.user?.user[dt], label: "Email" };
          }
        })
    : [
        { value: "email", label: "Email" },
        { value: "number", label: "Phone Number" },
      ];

  const hearAboutUs = [
    { value: "socialMedia", label: "Social Media" },
    { value: "friend", label: "Friend" },
    { value: "previousPatient", label: "Previous Patient" },
  ];
  const userAsPatient = { value: "user", label: user?.user?.user?.fullname };
  const patients =
    [
      // userAsPatient,
      ...patient?.userPatients?.map((item, index) => {
        return { value: item?.id, label: item?.attributes?.name };
      }),
    ] || [];
  // patients = [...patients];
  console.log({ loc });
  useEffect(() => {
    if (loc.state?.patientAdded && patients?.length) {
      handleChangePatient(patients[0]?.value);
    } else {
      form.setFieldsValue({
        email: user?.user?.user?.email,
      });
    }
    if (isAdmin) {
      form.setFieldsValue({
        ...stepData,
      });
    }
  }, [patients]);

  const handleChangePatient = (e) => {
    console.log(e);
    if (!e) {
      form.setFieldsValue({
        name: null,
        address_1: null,
        address_2: null,
        dob: null,
        city: null,
        state: null,
        zipcode: null,
        contact_you: null,
        hear_about_us: null,
        // social_security_number: null,
        contact_info: null,
      });
    } else if (e === "user") {
      const userAsPatient = {
        ...user.user.user,
      };
      console.log("userAsPatient", userAsPatient);
      const { fullname, dateOfBirth, email, phoneNumber } = userAsPatient;

      form.setFieldsValue({
        name: fullname,
        dob: moment(dateOfBirth),
        email,
        contact_info: phoneNumber.split("+1")[1],
      });
    } else {
      const singlePatient = patient?.userPatients?.find((dt) => dt?.id === e);
      if (singlePatient) {
        const SelectedPatient = {
          id: singlePatient?.id,
          email:
            loc.state?.appointmentId && singleAppoint
              ? singleAppoint?.user?.data?.attributes.email
              : user?.user?.user?.email,
          ...singlePatient?.attributes,
          // ...(loc.state?.patientAdded
          //   ? { email: user?.user?.user?.email }
          //   : {}),
        };
        const {
          name,
          address1,
          address2,
          city,
          state,
          zipCode,
          contact_you,
          hearAboutUs,
          securityNumber,
          contactNumber,
          dateOfBirth,
          email,
        } = SelectedPatient;

        form.setFieldsValue({
          name,
          address_1: address1,
          address_2: address2,
          dob: moment(dateOfBirth),
          city: city,
          state: state,
          zipcode: zipCode,
          contact_you,
          hear_about_us: hearAboutUs,
          email,
          // ...(loc.state?.patientAdded ? { email: email } : {}),

          // social_security_number: securityNumber,
          contact_info: contactNumber.split("+1")[1],
        });
      }
    }
  };
  return (
    <Form
      className="appoinment-step"
      form={form}
      initialValues={stepData}
      onFinish={handleSubmit}
    >
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
            <h4>{formSteps[0]}</h4>
          </div>
        </div>
        <Row gutter={[24, 16]}>
          {user?.user?.user && !isAdmin && (
            <Col md={12} lg={8} xs={24}>
              <label>Select Patient</label>
              <Select
                allowClear
                showSearch
                value={loc?.state?.patientAdded && patients[0]?.value}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? "").includes(input)
                }
                filterSort={(optionA, optionB) =>
                  (optionA?.label ?? "")
                    .toLowerCase()
                    .localeCompare((optionB?.label ?? "").toLowerCase())
                }
                placeholder="Select Added Patient"
                className="form-select"
                style={{
                  width: "100%",
                }}
                onChange={handleChangePatient}
                options={patients}
              />
            </Col>
          )}
          {step1.fields.map((item, index) => (
            <Col md={12} lg={8} xs={item.isSmall ? 12 : 24} key={index}>
              <label>{item.label}</label>
              <Form.Item name={item.title} rules={item.rules}>
                {item.type === "date" ? (
                  <DatePicker
                    inputReadOnly
                    format={"MM-DD-YYYY"}
                    className="form-input"
                    placeholder={item.placeholder}
                    disabledDate={(current) => current.isAfter(moment())}
                  />
                ) : item.title === "contact_you" ? (
                  <Select
                    placeholder={item.placeholder}
                    className="form-select"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {contactYouOptions?.map((data, index) => (
                      <Select.Option value={data.value} key={index}>
                        {data.label}
                      </Select.Option>
                    ))}
                  </Select>
                ) : item.hasDropdown ? (
                  <Select
                    placeholder={item.placeholder}
                    className="form-select"
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {hearAboutUs?.map((data, index) => (
                      <Select.Option value={data.value} key={index}>
                        {data.label}
                      </Select.Option>
                    ))}
                  </Select>
                ) : item.title === "contact_info" ? (
                  <Input
                    prefix={"+1"}
                    type={item.type}
                    placeholder={item.placeholder}
                    className="form-input"
                  />
                ) : (
                  // : item.title === "social_security_number" ? (
                  //   <Input
                  //     type={item.type}
                  //     placeholder={item.placeholder}
                  //     className="form-input"
                  //   />
                  // )
                  <Input
                    type={item.type}
                    placeholder={item.placeholder}
                    className="form-input"
                  />
                )}
              </Form.Item>
            </Col>
          ))}
        </Row>
      </div>
      <div className="btn-wrapper">
        <ButtonComponent text={step1.btn} />
      </div>
    </Form>
  );
};

export default AppoinmentStep1;
