import React, { useState } from "react";
import {
  WEB_STRINGS,
  SUCCESS_MESSAGES,
  APPOINMENT_DETAIL_ROUTE,
  APPOINMENT_ROUTE,
  APPOINMENTS_ROUTE,
  ADD_PATIENT_ROUTE,
  ALERT_TYPES,
} from "../../../constants";
import { toastAlert } from "../../../services/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { AppoinmentStep1, AppoinmentStep2, AppoinmentStep3 } from "./steps";
import "./styles.scss";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import {
  addAppointmentRequest,
  addAuthAppointmentRequest,
  getSingleAppointmentRequest,
  updateAppointmentShiftRequest,
} from "../../../redux/slicers/appointment";
import { useEffect } from "react";
import { getPatientRequest } from "../../../redux/slicers/patient";
const RequestAppoinment = () => {
  const { dr } = useParams();
  const loc = useLocation();
  const dispatch = useDispatch();
  const state = useSelector((state) => state);
  const { user, patient, appointment } = state;
  const { formSteps, step2 } = WEB_STRINGS.Appoinment;
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [firstStepData, setFirstStepData] = useState(null);
  const [secondStepData, setSecondStepData] = useState(null);
  const [thirdStepData, setThirdStepData] = useState(null);
  const [ispatientsData, setispatientsData] = useState(true);

  const [isPolicyHolderPatient, setisPolicyHolderPatient] = useState(
    step2.policyHolder.options[0].value
  );

  const handleIsPolicyHolderPatient = (val) => {
    setisPolicyHolderPatient(val);
  };
  // HANDLERS

  const isAdmin = user?.user?.isAdmin;
  const singleAppoint = appointment?.singleAppointment;

  console.log({ userPatients: patient?.userPatients });
  useEffect(() => {
    if (user?.user?.user && !isAdmin) {
      dispatch(
        getPatientRequest({
          payloadData: null,
          responseCallback: (status, res) => {
            setispatientsData(false);
            if (status) {
            } else {
            }
          },
        })
      );
    }
    if (isAdmin && loc.state?.appointmentId) {
      dispatch(
        getSingleAppointmentRequest({
          payloadData: loc.state?.appointmentId,
          responseCallback: (status, res) => {
            if (status) {
            } else {
            }
          },
        })
      );
    }
  }, []);

  useEffect(() => {
    if (isAdmin && singleAppoint) {
      console.log({ singleAppoint });
      setispatientsData(false);
      // dispatch(
      //   getPatientRequest({
      //     payloadData: null,
      //     responseCallback: (status, res) => {
      //       if (status) {
      //       } else {
      //       }
      //     },
      //   })
      // );

      const {
        hearAboutUs,
        contactNumber,
        contact_you,
        zipCode,
        city,
        state,
        address1,
        address2,
        dateOfBirth,
        name,
        email,
        insurancePolicyHolderIsPatient,
        insurancePolicyHolderName,
        insuranceNumber,
        insuranceGroupNumber,
        health_insurance_plan_name,
        otherHealthInsurancePlan,
        slot,
        urgencyReason,
        reasonToVisit,
      } = singleAppoint;

      const firstStepDataAdmin = {
        name,
        email,
        dob: moment(dateOfBirth),
        address_1: address1,
        address_2: address2,
        city,
        state,
        zipcode: zipCode,
        contact_you,
        contact_info: contactNumber.replace("+1", ""),
        hear_about_us: hearAboutUs,
      };

      const secondStepDataAdmin = {
        insurancePolicyHolderIsPatient,
        policy_holder_name: insurancePolicyHolderName,
        health_insurance_number: insuranceNumber,
        group_number: insuranceGroupNumber,
        health_insurance_plan_name: health_insurance_plan_name?.data?.id,
        ...(otherHealthInsurancePlan ? { otherHealthInsurancePlan } : {}),
      };

      const thirdStepDataAdmin = {
        preferred_appointment_time: slot?.id,
        urgency: urgencyReason,
        reason: reasonToVisit,
      };

      setisPolicyHolderPatient(insurancePolicyHolderIsPatient);
      setFirstStepData(firstStepDataAdmin);
      setSecondStepData(secondStepDataAdmin);
      setThirdStepData(thirdStepDataAdmin);
    }
  }, [singleAppoint]);

  useEffect(() => {
    if (
      user?.user?.user &&
      !ispatientsData &&
      !patient?.userPatients?.length &&
      !isAdmin
    ) {
      toastAlert(
        "Please add a Patient to book an appointment",
        ALERT_TYPES.info
      );
      navigate(ADD_PATIENT_ROUTE, { state: { doctorId: dr } });
    }
  }, [patient?.userPatients]);

  const setFirstStepHandler = (data) => {
    window.scrollTo(0, 0);
    setFirstStepData(data);
    setCurrentStep(2);
  };
  const setSecondStepHandler = (data) => {
    window.scrollTo(0, 0);
    setSecondStepData(data);
    setCurrentStep(3);
  };

  const setThirdStepHandler = (data) => {
    window.scrollTo(0, 0);
    setThirdStepData(data);

    const addAppointment = {
      // first step
      name: firstStepData?.name,
      email: firstStepData?.email,
      dateOfBirth: moment(firstStepData.dob).format("YYYY-MM-DD"),
      address1: firstStepData.address_1,
      address2: firstStepData?.address_2 ? firstStepData?.address_2 : "",
      city: firstStepData.city,
      state: firstStepData.state,
      zipCode: firstStepData.zipcode,
      contact_you:
        firstStepData.contact_you === "email"
          ? firstStepData?.email
          : firstStepData.contact_you === "number"
          ? "+1" + firstStepData.contact_info
          : firstStepData.contact_you,
      contactNumber: "+1" + firstStepData.contact_info,
      hearAboutUs: firstStepData.hear_about_us,
      // second step
      insurancePolicyHolderIsPatient: isPolicyHolderPatient,
      insurancePolicyHolderName: secondStepData.policy_holder_name,
      insuranceNumber: secondStepData.health_insurance_number,
      insuranceGroupNumber: secondStepData.group_number,
      health_insurance_plan_name: secondStepData?.health_insurance_plan_name,
      ...(secondStepData?.otherHealthInsurancePlan
        ? { otherHealthInsurancePlan: secondStepData?.otherHealthInsurancePlan }
        : {}),

      //third step
      slot: data?.preferred_appointment_time,
      urgencyReason: data?.urgency,
      reasonToVisit: data?.reason,
      user:
        user?.user?.user && !isAdmin
          ? user?.user?.user.id
          : user?.user?.user && isAdmin
          ? singleAppoint?.user?.data?.id
          : null,
      doctor: Number(dr),
    };

    if (isAdmin) {
      var result = {};
      let singleAppointAdmin = {
        ...singleAppoint,
      };
      singleAppointAdmin.doctor = singleAppoint?.doctor?.id;
      singleAppointAdmin.user = singleAppoint?.user?.data?.id;
      singleAppointAdmin.slot = singleAppoint?.slot?.id;
      singleAppointAdmin.health_insurance_plan_name =
        singleAppoint?.health_insurance_plan_name?.data?.id;

      for (var key in addAppointment) {
        if (addAppointment[key] !== singleAppointAdmin[key]) {
          result[key] = addAppointment[key];
        }
      }

      console.log({ addAppointment }, { singleAppointAdmin }, { result });
      dispatch(
        updateAppointmentShiftRequest({
          payloadData: {
            data: { editByAdmin: true, ...result },
            id: loc.state.appointmentId,
          },
          responseCallback: (status, res) => {
            if (status) {
              setFirstStepData(null);
              setSecondStepData(null);
              setThirdStepData(null);
              navigate(-1);
              setCurrentStep(1);
              toastAlert(
                "Appointment Updated Sucessfully!",
                ALERT_TYPES.success
              );
            } else {
            }
          },
        })
      );
    } else {
      if (!user?.user?.user) {
        dispatch(
          addAppointmentRequest({
            payloadData: { data: addAppointment },
            responseCallback: (status, res) => {
              if (status) {
                setFirstStepData(null);
                setSecondStepData(null);
                setThirdStepData(null);
                navigate(-1);
                setCurrentStep(1);
                toastAlert(SUCCESS_MESSAGES.APPOINMENT_FORM);
              } else {
              }
            },
          })
        );
      } else {
        dispatch(
          addAuthAppointmentRequest({
            payloadData: { data: addAppointment },
            responseCallback: (status, res) => {
              console.log("response", res);
              if (status) {
                setFirstStepData(null);
                setSecondStepData(null);
                setThirdStepData(null);
                const appointmentDetailRoute =
                  APPOINMENT_DETAIL_ROUTE?.split(":");
                navigate(APPOINMENTS_ROUTE);
                setCurrentStep(1);
                toastAlert(SUCCESS_MESSAGES.APPOINMENT_FORM);
              } else {
              }
            },
          })
        );
      }
    }
  };

  const formPagination = () => (
    <div className="form-pagination">
      {formSteps.map((item, index) => {
        const step = index + 1;
        const currentStepData =
          step === 2
            ? secondStepData
            : step === 3
            ? thirdStepData
            : firstStepData;
        return (
          <React.Fragment key={index}>
            {index !== 0 && (
              <div
                className="outline"
                style={{
                  border:
                    step === currentStep + 2
                      ? "1px dashed #1F4997"
                      : "1px solid #2399f1",
                }}
              />
            )}
            <div className="step">
              <span
                className="count"
                style={{
                  background:
                    step === currentStep + 1
                      ? "#1F4997"
                      : step === currentStep + 2
                      ? "rgb(0, 44, 95, 0.1)"
                      : "#2399F1",
                  color: step === currentStep + 2 ? "#002c5f" : "#fff",
                }}
              >
                {currentStepData ? <FontAwesomeIcon icon={faCheck} /> : step}
              </span>
              <span
                className="ttl"
                style={{
                  color:
                    step === currentStep + 1
                      ? "#1F4997"
                      : step === currentStep + 2
                      ? "rgba(31, 73, 151, 0.5)"
                      : "#2399F1",
                }}
              >
                {item}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );

  const formStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <AppoinmentStep1
            pagination={formPagination}
            stepData={firstStepData}
            onSubmit={setFirstStepHandler}
            previousStep={() => {
              navigate(-1);
            }}
          />
        );
      case 2:
        return (
          <AppoinmentStep2
            step1Data={firstStepData}
            pagination={formPagination}
            stepData={secondStepData}
            onSubmit={setSecondStepHandler}
            previousStep={() => {
              setCurrentStep(1);
            }}
            isPolicyHolderPatient={isPolicyHolderPatient}
            handleIsPolicyHolderPatient={handleIsPolicyHolderPatient}
          />
        );
      case 3:
        return (
          <AppoinmentStep3
            pagination={formPagination}
            stepData={thirdStepData}
            onSubmit={setThirdStepHandler}
            previousStep={() => {
              setCurrentStep(2);
            }}
          />
        );
      default:
        return "";
    }
  };

  return (
    <section className="appoinment-wrapper">
      <div className="container">{formStep()}</div>
    </section>
  );
};

export default RequestAppoinment;
