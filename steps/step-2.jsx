import React, { useState } from "react";
import { Row, Col, Form, Input, Radio, Select } from "antd";
import { WEB_STRINGS } from "../../../../constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { ButtonComponent } from "../../../../components";
import "./styles.scss";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getHealthInsurancePlanRequest } from "../../../../redux/slicers/general";
const AppoinmentStep2 = ({
  pagination,
  stepData,
  onSubmit,
  previousStep,
  handleIsPolicyHolderPatient,
  isPolicyHolderPatient,
  step1Data,
}) => {
  const { formSteps, step2 } = WEB_STRINGS.Appoinment;
  const [policyHolder, setPolicyHolder] = useState(() => isPolicyHolderPatient);
  const [healthInsurancePlans, sethealthInsurancePlans] = useState(null);

  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const handleSubmit = () => {
    const values = form.getFieldsValue();
    onSubmit(values);
    console.log({ values });
  };
  console.log("policyHolder", isPolicyHolderPatient);
  const handlePolicyHolderName = (val) => {
    if (!val) {
      const values = form.getFieldsValue();
      form.setFieldsValue({
        ...values,

        policy_holder_name: null,
      });
      setPolicyHolder(val);
    } else {
      const values = form.getFieldsValue();
      form.setFieldsValue({
        ...values,

        policy_holder_name: step1Data?.name,
      });

      setPolicyHolder(val);
    }
  };

  useEffect(() => {
    if (policyHolder) {
      const values = form.getFieldsValue();
      form.setFieldsValue({
        group_number: values?.group_number,
        health_insurance_number: values?.health_insurance_number,
        health_insurance_plan: values?.health_insurance_plan,
        policy_holder_name: step1Data?.name,
      });
      console.log("policyHolder", step1Data, values, policyHolder);
    } else if (!policyHolder) {
      const values = form.getFieldsValue();
      form.setFieldsValue({
        ...values,
      });
    }
    dispatch(
      getHealthInsurancePlanRequest({
        payloadData: null,
        responseCallback: (status, res) => {
          console.log({ res });
          if (res?.data?.length) {
            let arr = [];
            for (const item of res?.data) {
              arr.push({
                isOther: item?.attributes?.isOther,
                value: item?.id,
                label: item?.attributes?.planName,
              });
            }
            sethealthInsurancePlans(arr);
          }
        },
      })
    );
  }, []);
  return (
    <Form
      className="appoinment-step"
      initialValues={stepData}
      form={form}
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
            <h4>{formSteps[1]}</h4>
          </div>
        </div>
        <Row gutter={[24, 16]}>
          <Col xs={24}>
            <div className="options-wrapper">
              <label>{step2.policyHolder.label}</label>
              <Radio.Group
                value={policyHolder}
                onChange={(e) => {
                  handlePolicyHolderName(e.target.value);
                  handleIsPolicyHolderPatient(e.target.value);
                }}
              >
                {step2.policyHolder.options.map((item, index) => (
                  <Radio value={item.value} key={index}>
                    {item.label}
                  </Radio>
                ))}
              </Radio.Group>
            </div>
          </Col>
          {step2.fields.map((item, index) =>
            item.type === "select" ? (
              <Col md={12} xs={24} key={index}>
                <label>{item.label}</label>
                <Form.Item name={item.title} rules={item.rules}>
                  <Select
                    options={healthInsurancePlans}
                    placeholder={item.placeholder}
                    className="form-select"
                  />
                </Form.Item>
              </Col>
            ) : item.title === "otherHealthInsurancePlan" ? (
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  healthInsurancePlans?.find(
                    (dt) =>
                      dt.value === currentValues.health_insurance_plan_name
                  )?.isOther ||
                  !healthInsurancePlans?.find(
                    (dt) =>
                      dt.value === currentValues.health_insurance_plan_name
                  )?.isOther
                }
              >
                {({ getFieldValue }) =>
                  healthInsurancePlans?.find(
                    (dt) =>
                      dt?.value === getFieldValue("health_insurance_plan_name")
                  )?.isOther ? (
                    <Col md={12} xs={24} key={index}>
                      <label>{item.label}</label>
                      <Form.Item name={item.title} rules={item.rules}>
                        <Input
                          type={item.type}
                          placeholder={item.placeholder}
                          className="form-input"
                        />
                      </Form.Item>
                    </Col>
                  ) : null
                }
              </Form.Item>
            ) : (
              <Col md={12} xs={24} key={index}>
                <label>{item.label}</label>
                <Form.Item name={item.title} rules={item.rules}>
                  <Input
                    disabled={
                      item.title === "policy_holder_name" &&
                      policyHolder &&
                      true
                    }
                    type={item.type}
                    placeholder={item.placeholder}
                    className="form-input"
                  />
                </Form.Item>
              </Col>
            )
          )}
        </Row>
      </div>
      <div className="btn-wrapper">
        <ButtonComponent text={step2.btn} />
      </div>
    </Form>
  );
};

export default AppoinmentStep2;
