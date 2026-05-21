import { Component, For, useContext } from "solid-js";
import { GameData } from "./data";
import { toTimeString } from "./utils/time";

export const Score: Component = () => {
  const data = useContext(GameData);
  return (
    <div class="w-full h-full">
      <table class="w-full table-auto">
        <thead class="[&_th]:text-left">
          <tr>
            <th>Mines</th><th>Size</th><th>Time</th>
          </tr>
        </thead>
        <tbody>
          <For each={data?.data()?.history ?? []}>{
            (h) => (
              <tr><td>{h.m}</td><td>{h.s}</td><td>{toTimeString(h.t)}</td></tr>
            )
          }</For>
        </tbody>
      </table>
    </div>
  );
};
