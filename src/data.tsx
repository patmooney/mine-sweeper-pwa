import { Accessor, createContext, createSignal, onMount, ParentComponent } from "solid-js";

export interface IData {
  total?: number;
  history?: Array<{
    s: number;
    m: number;
    t: number;
  }>
}

export const GameData = createContext<{
  data: Accessor<IData | undefined>,
  onAddGame: (time: number, mines: number, size: number) => void;
}>();

const DATA_KEY = "freesweep";

export const DataProvider: ParentComponent = (props) => {
  const [data, setData] = createSignal<IData>();

  onMount(() => {
    const d = window.localStorage.getItem(DATA_KEY);
    setData(JSON.parse(d ?? "{}") as IData);
  });

  const onAddGame = (time: number, mines: number, size: number) => {
    const { total, history } = data() ?? {};
    setData({
      total: (total ?? 0) + 1,
      history: [
        ...(history ?? []),
        { s: size, m: mines, t: time }
      ]
    });
    window.localStorage.setItem(DATA_KEY, JSON.stringify(data() ?? {}));
  };

  return <GameData.Provider value={{ data, onAddGame }}>{props.children}</GameData.Provider>;
};
