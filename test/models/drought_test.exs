defmodule Drought.DroughtTest do
  use Drought.ModelCase

  alias Drought.Drought

  @valid_attrs %{date: %{day: 17, month: 4, year: 2010}}
  @invalid_attrs %{}

  test "changeset with valid attributes" do
    changeset = Drought.changeset(%Drought{}, @valid_attrs)
    assert changeset.valid?
  end

  test "changeset with invalid attributes" do
    changeset = Drought.changeset(%Drought{}, @invalid_attrs)
    refute changeset.valid?
  end
end
