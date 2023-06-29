const queueMessages = [
  {
    title: 'book title 1',
    description: 'book description 1',
    price: 1000,
    count: 2,
  },
  {
    title: 'book title 2',
    description: 'book description 2',
    price: 2000,
    count: 1,
  },
];

export const queueMessageStrings = queueMessages.map((item) =>
  JSON.stringify(item)
);

export const catalogBatchProcessEvent = {
  Records: queueMessages.map((item) => ({ body: JSON.stringify(item) })),
};

export const catalogBatchProcessEventWithIncorrectData = {
  Records: queueMessages.map((item) => ({
    body: JSON.stringify({
      description: item.description,
      price: item.price,
      count: item.count,
    }),
  })),
};
