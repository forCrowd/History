import { Injectable } from "@angular/core";
import { Element, ProjectService, Project } from "@forcrowd/backbone-client-core";

@Injectable()
export class AppProjectService extends ProjectService {
  createProjectHistory(): Project {
    // Project
    const project = super.createProjectEmpty();
    project.Name = "History App";
    project.Origin = "http://history.forcrowd.org";

    // Books
    const books = super.createElement({
      Project: project,
      Name: "Books"
    }) as Element;

    // First book
    super.createElementItem({
      Element: books,
      Name: "My first book entry"
    });

    // Articles
    const articles = super.createElement({
      Project: project,
      Name: "Articles"
    }) as Element;

    // First article
    super.createElementItem({
      Element: articles,
      Name: "My first article entry"
    });

    // Movies
    const movies = super.createElement({
      Project: project,
      Name: "Movies"
    }) as Element;

    // First movie
    super.createElementItem({
      Element: movies,
      Name: "My first movie entry"
    });

    // Travels
    const travels = super.createElement({
      Project: project,
      Name: "Travels"
    }) as Element;

    // First movie
    super.createElementItem({
      Element: travels,
      Name: "My first travel entry"
    });

    return project;
  }
}
