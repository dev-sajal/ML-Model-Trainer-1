from typing import Optional, IO
from pathlib import Path
import logging

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn import metrics
import pandas as pd


log = logging.getLogger(__name__)


class GenericModel:
    ALGO_MAPPER = {
        "Logistic Regression": LogisticRegression,
        "Linear Regression": LinearRegression,
        "Decision Tree": DecisionTreeClassifier,
    }

    def __init__(
        self,
        algo_name: str,
        file: IO,
        target_var: str,
        test_size: float = 0.2,
    ) -> None:
        try:
            self.model = self.ALGO_MAPPER[algo_name]()
        except KeyError:
            log.error(f"{algo_name} not supported!")

        self.file = file
        self.test_size = test_size
        self.target_var = target_var
        self.multiclass = False

    def read_file(self, filepath: str) -> Optional[pd.DataFrame]:
        filepath = Path(filepath)
        if filepath.exists() and filepath.suffix == ".csv":
            df = pd.read_csv(filepath)
            return df
        else:
            log.error(f"Filepath: {filepath} does not exists or is not a csv!")

    def split_data(self, data):
        train_df, test_df = train_test_split(data, test_size=self.test_size)
        log.info(
            f"# Training examples: {train_df.shape[0]}, # Test Examples: {test_df.shape[0]}"
        )
        return train_df, test_df

    def create_report(self, true_values, predictions):
        report = {
            "accuracy": metrics.accuracy_score(true_values, predictions),
            "precision": metrics.precision_score(
                true_values,
                predictions,
                average="micro" if self.multiclass else "binary",
            ),
            "f1-score": metrics.f1_score(
                true_values,
                predictions,
                average="micro" if self.multiclass else "binary",
            ),
            "confusion_matriex": metrics.confusion_matrix(
                true_values, predictions
            ).tolist(),
        }
        return report

    def train_model(self, features, labels):
        log.info(
            f"Training the model with {features.shape[0]} examples and {features.shape[1]} features."
        )
        self.model.fit(features, labels)
        return self.model

    def get_predictions(self, features):
        if not features.shape[1] == self.model.n_features_in_:
            log.error(
                f"Shape Mismatch!! Model trained with {self.model.n_features_in_} features,"
                f" received: {features.shape[1]} features"
            )
            return

        return self.model.predict(features)

    def run(self):
        try:
            data = pd.read_csv(self.file)
        except Exception as e:
            log.error(f"Error reading file: {e}", exc_info=True)
            return

        if self.target_var not in data.columns:
            log.error(
                f"{self.target_var} not found in data. Provide exact column name."
            )
            return

        if data[self.target_var].nunique() > 2:
            self.multiclass = True

        X_train, X_test = self.split_data(data)
        y_train = X_train.pop(self.target_var)
        y_test = X_test.pop(self.target_var)

        self.train_model(X_train, y_train)

        log.info("Getting Train Predictions...")
        train_predictions = self.get_predictions(X_train)
        log.info("Getting Test Predictions...")
        test_predictions = self.get_predictions(X_test)

        log.info("Getting Train Report...")
        train_report = self.create_report(
            true_values=y_train, predictions=train_predictions
        )
        log.info("Getting Test Report...")
        test_report = self.create_report(
            true_values=y_test, predictions=test_predictions
        )
        return {"train": train_report, "test": test_report}
