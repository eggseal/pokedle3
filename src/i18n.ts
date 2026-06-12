import { init, getLocaleFromNavigator, addMessages } from "svelte-i18n";
import en from "./lang/en.json";
import es from "./lang/es.json";

addMessages("en", en);
addMessages("es", es);

init({
  fallbackLocale: "en",
  initialLocale: getLocaleFromNavigator(),
});