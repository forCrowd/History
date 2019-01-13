import { Element } from "@forcrowd/backbone-client-core";

export class Timeline extends Element {
  public get UrlKey() {
    return this.Name.replace(/\s/g, "-").replace(/[^a-z0-9-]/gi, "");
  }
}
