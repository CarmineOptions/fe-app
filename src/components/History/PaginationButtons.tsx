import { Button } from "../common";

type Props = {
  page: number;
  setPage: (n: number) => void;
  total: number;
  pageSize: number;
};

export const PaginationButtons = ({
  page,
  setPage,
  total,
  pageSize,
}: Props) => {
  const pageCount = Math.ceil(total / pageSize);
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  const handlePageClick = (p: number) => {
    if (p !== page) {
      setPage(p);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="flex gap-2">
        {pages.map((p) => (
          <Button
            key={p}
            type={p === page ? "secondary" : "dark"}
            onClick={() => handlePageClick(p)}
          >
            {p}
          </Button>
        ))}
      </div>
    </div>
  );
};
