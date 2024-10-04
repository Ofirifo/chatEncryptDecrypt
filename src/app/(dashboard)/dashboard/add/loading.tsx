import { FC } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface loadingProps {}

const loading: FC<loadingProps> = ({}) => {
  return (
    <div className="w-full flex flex-col gap-3">
      <Skeleton className="mb-3" height={50} width={400} />
      <Skeleton height={10} width={100} />
      <Skeleton height={30} width={300} />
    </div>
  );
};

export default loading;
