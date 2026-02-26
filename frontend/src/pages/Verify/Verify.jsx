import { useNavigate, useSearchParams } from "react-router-dom";
import "./Verify.css";
import { useContext } from "react";
import { SyncLoader } from "react-spinners";
import { StoreContext } from "../../components/context/StoreContext";
import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";

const Verify = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");

  const { url } = useContext(StoreContext);
  const navigate = useNavigate();

  const verifyPayment = async () => {
    const response = await axios.post(url + "/api/order/verify", {
      success,
      orderId,
    });
    if (response.data.success) {
      navigate("/myorders");
    } else {
      navigate("/");
    }
    // setLoading(true);
  };

  useEffect(() => {
    verifyPayment();
  }, []);

  return (
    <div className="verify">
      <div className="spinner">
        <SyncLoader color={"tomato"} loading={loading} />
      </div>
    </div>
  );
};

export default Verify;
